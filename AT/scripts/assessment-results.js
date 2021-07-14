// global variables
const jsonURL = 'https://api.jsonbin.io/b/60e6d34a9328b059d7b9e1ff';
const wrapper = $('.assessment-tool-results');
const colors = { teal: '#20c997' }

$(document).ready(function () {

	$.ajax({
		url: jsonURL,
		type: "GET",
		dataType: "json",
		beforeSend: function (xhr) {
			xhr.setRequestHeader(
				"secret-key",
				"$2b$10$AebJkuUBlBjl4b7KufLvCeFY8nC9hVBfYNPeXVpn.e2CVxghNnMky"
			);
		},
		success: function (json) {
			if(json) {
				generateResults(json);
			}
		},
		error: function () {
			alert("There's an error. Please reload the page.");
		},
	});

});


// generate results
function generateResults(json) {
	const content = wrapper.find('.content');
	const loading = wrapper.find('.loading');

	loading.hide();
	generateLegends(json.Levels);
	generateCategories(json.Category);
	generateSVG(json.Category);
	content.show();

	// window.print();
}


// generate legends
function generateLegends(levels) {
	const legendsWrapper = wrapper.find('.legends');
	const list = $('<div class="legend-list"></div>');
	let els = '';
	levels.forEach((level) => {
		els += `<div class="legend-item">${level.Title}</div>`;
	})
	list.html(els);
	list.appendTo(legendsWrapper);
}


// generate categories
function generateCategories(categories) {
	const selectedCategoriesWrapper = wrapper.find('.selected-categories');
	const unselectedCategoriesWrapper = wrapper.find('.unselected-categories');
	const selectedCategoriesEl = $('<div class="categories"></div>');
	const unselectedCategoriesEl = $('<div class="categories"></div>');
	let selectedCategoriesList = '';
	let unselectedCategoriesList = '';

	categories.forEach((category) => {
		if(category.Selected) {
			selectedCategoriesList += `
				<div class="category-wrapper">
					<div class="category">
						<div class="category-name">${category.Category}</div>
						<div class="bar-graph-wrapper">
							<div class="level current-level">
								<div class="number">${category.AverageCurrentLevel}</div>
								<div class="label">current</div>
								<div class="bar-graph level-${category.AverageCurrentLevel}">
									<div class="bar"></div>
									<div class="bar"></div>
									<div class="bar"></div>
									<div class="bar"></div>
									<div class="bar"></div>
								</div>
							</div>
							<svg class="arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19 7"><path fill="black" fill-rule="nonzero" d="M6.611.25l-7 3.25 7 3.25.001-3.001 12.638.001v-.5L6.612 3.249V.25z"/></svg>
							<div class="level desired-level">
								<div class="number">${category.AverageDesiredLevel}</div>
								<div class="label">desired</div>
								<div class="bar-graph level-${category.AverageDesiredLevel}">
									<div class="bar"></div>
									<div class="bar"></div>
									<div class="bar"></div>
									<div class="bar"></div>
									<div class="bar"></div>
								</div>
							</div>
						</div>
					</div>
				</div>
			`;
		} else {
			unselectedCategoriesList += `<div class="category">${category.Category}</div>`;
		}
	})

	selectedCategoriesEl.html(selectedCategoriesList);
	selectedCategoriesEl.appendTo(selectedCategoriesWrapper);

	unselectedCategoriesEl.html(unselectedCategoriesList);
	unselectedCategoriesEl.appendTo(unselectedCategoriesWrapper);
}


// generate svg
function generateSVG(categories) {
	const infographicWrapper = wrapper.find('.infographic-results-wrapper');
	infographicWrapper.html(infographicResults());

	categories.forEach((category) => {
		if(category.Selected) {

			// update results svg based on data
			const categoryName = category.Category.replace(/\s/g, '-');
			const categorySelector = document.querySelector(`.infographic-results-wrapper #${categoryName}`);
			if(categorySelector) {
				const categorySVG = categorySelector.parentElement;
				categorySVG.classList.add('is-enabled');
				categorySVG.classList.add('is-active');

				// set value
				const levelMeter = categorySelector.querySelector('#level-meter');
				let levelNumbers = categorySelector.querySelectorAll(['#number-1', '#number-2', '#number-3', '#number-4', '#number-5']);
				let levelLines = categorySelector.querySelectorAll(['#line-1', '#line-2', '#line-3', '#line-4']);
				const desiredLevel5 = categorySelector.querySelector('#desired-level-5');

				// set elements
				gsap.set(levelMeter, {
					transformOrigin: 'bottom',
					scaleY: 0
				});
				gsap.set(desiredLevel5, {
					eransformOrigin: 'center',
					scale: 0
				});
				gsap.set(levelMeter, {
					scaleY: category.AverageCurrentLevel * 0.2
				})

				levelNumbers.forEach(function(number, index) {
					const value = index + 1;
					if(category.AverageCurrentLevel >= value) {
						gsap.set(number, { fill: 'white' })
					}
				})

				if(category.AverageDesiredLevel == 5) {
					gsap.set(desiredLevel5, {
						scale: 1
					})
					gsap.set(levelLines, {
						fill: '#EEEEEE'
					})
				} else {
					gsap.set(desiredLevel5, {
						scale: 0
					})
					levelLines.forEach(function(line, index) {
						const value = index + 1;
						if(category.AverageDesiredLevel == value) {
							gsap.to(line, { fill: colors.teal })
						}
					})
				}

			}
		}
	})
}
