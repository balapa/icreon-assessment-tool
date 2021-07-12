// global variables
const assessmentTool = $('#assessment-tool');
const assessmentToolResults = $('.assessment-tool-results');
const colors = { teal: '#20c997' }
const transition = { x: 50 }
const selectedCategories = [];
const selectedCategoriesObject = [];
let results = {};
const jsonURL = 'https://api.jsonbin.io/b/60e5661cfe016b59dd5e5ca7/1';

// gsap settings
gsap.defaults({
	duration: 0.3
});

$(document).ready(function () {
	selectCategories();
	initialSteps();
	retakeAssessment();
});


// retake assessment
function retakeAssessment() {
	const button = $('.retake-assessment');
	if(button) {
		button.on('click', function() {
			window.location.reload();
		})
	}
}


// select categories from infographic
function selectCategories() {
	const infographic = $('.infographic-base-wrapper svg');
	const evaluationTrigger = $('.evaluation-trigger');

	if(infographic) {
		const triggers = infographic.find('#category #trigger');
		triggers.each(function() {
			const categoryEl = $(this).children()[0];
			let triggerState = false;
			let category = categoryEl.id;
			category = category.replace(/-/g, ' ');
			category = category.replace('&','');

			$(this).on('click', function() {

				if(triggerState) {
					$(this).removeClass('is-active');
					selectedCategories.pop(category);
				} else {
					$(this).addClass('is-active');
					selectedCategories.push(category);
				}
				triggerState = !triggerState;

				// disable if there are 3 categories selected
				if(selectedCategories.length == 3) {
					triggers.each(function() {
						if(!$(this).hasClass('is-active')) {
							$(this).addClass('is-disabled');
						}
					})
				} else {
					triggers.removeClass('is-disabled');
				}

				if(selectedCategories.length > 0) {
					evaluationTrigger.removeClass('is-disabled');
				} else {
					evaluationTrigger.addClass('is-disabled');
				}

			});

		})
	}
}


// initial steps
function initialSteps() {
	const evaluationTrigger = $('.evaluation-trigger');
	const competenciesTrigger = $('.competencies-trigger');
	const preStepArray = $('.initial-step .content-wrapper > div');
	const rootSteps = $('.root-step');
	const infographicBaseWrapper = $('.infographic-base-wrapper');

	competenciesTrigger.on('click', function() {
		animateStep(preStepArray, 'next', 1, 0);
		infographicBaseWrapper.removeClass('is-disabled');
	});

	evaluationTrigger.on('click', function() {

		$.ajax({
			url: jsonURL,
			type: "GET",
			dataType: "json",
			beforeSend: function (xhr) {
				assessmentTool.addClass('loading');
				xhr.setRequestHeader(
					"secret-key",
					"$2b$10$AebJkuUBlBjl4b7KufLvCeFY8nC9hVBfYNPeXVpn.e2CVxghNnMky"
				);
			},
			success: function (json) {
				if(json) {
					generateQuestionnaire(json);
					animateStep(rootSteps, 'next', 1, 0);
				}
			},
			error: function () {
				alert("There's an error. Please reload the page.");
			},
		});

	});
}



// generate questionnaire
function generateQuestionnaire(json) {

	// assign json to a new object
	results = json;
	const categories = results.Category;
	const questionnaire = $('.questionnaire');

	// filter categories
	categories.forEach((category) => {
		selectedCategories.forEach((selectedCategory) => {
			if(selectedCategory == category.Category) {
				category.Selected = true;
				selectedCategoriesObject.push(category);
			}
		})
	})

	selectedCategoriesObject.forEach((category, categoryIndex) => {

		if(category.Selected) {

			let categoriesList = '';
			selectedCategoriesObject.forEach((selectedCategory, selectedCategoryIndex) => {
				let categoryClass = '';
				if(selectedCategoryIndex < categoryIndex) {
					categoryClass = 'is-done';
				}
				if(selectedCategory.Category == category.Category) {
					categoryClass = 'is-active';
				}
				categoriesList += `
					<div class="category ${categoryClass}">
						${selectedCategory.Category.toLowerCase()}
					</div>
				`;
			});

			// generate steps
			if(category.QuestionsList) {

				category.QuestionsList.forEach((item, questionIndex) => {

					const questionID = category.Category.replace(/\s+/g, '-').toLowerCase() + '-' + questionIndex;
					const question = item.Question;
					const answers = item.AnswersList;
					const step = $(`<div data-category="${category.Category}" class="questionnaire-step"></div>`);
					let answersEl;

					let backButton = `
						<div class="icreon-button prev" data-question-index="${questionIndex}" data-category="${category.Category}">
							<div class="arrow-wrapper"></div>
							<div class="label">
								<div class="text">prev</div>
							</div>
						</div>
					`;
					let nextButtonClass = 'next';
					if(categoryIndex == (selectedCategoriesObject.length - 1) && questionIndex == (category.QuestionsList.length - 1)) {
						nextButtonClass += ' analysis-trigger';
					}

					// generate indicator
					let indicator = `<div data-category="${category.Category}" class="steps-indicator">
						<span class="current-step">${questionIndex + 1}</span>
						<span class="separator"> / </span>
						<span class="step-length">${category.QuestionsList.length}</span>
					</div>`;

					if(categoryIndex == 0 && questionIndex == 0) {
						backButton = '';
					}

					if(answers) {
						answersEl = `<div class="levels-wrapper">
							<div class="level-wrapper level-head">
								<div class="current">
									<div class="label">current</div>
								</div>
								<div class="desired">
									<div class="label">desired</div>
								</div>
							</div>
						`;

						answers.forEach((answer, index) => {
							const answerIndex = index + 1;
							answersEl += `
								<div class="level-wrapper">
									<div class="current">
										<div data-question-index="${questionIndex}" data-category="${category.Category}" data-level="${answerIndex}" 
										class="level current-level">level ${answerIndex}</div>
									</div>
									<div class="desired">
										<div data-question-index="${questionIndex}" data-category="${category.Category}" data-level="${answerIndex}" 
										class="level desired-level">level ${answerIndex}</div>
									</div>
									<div class="answer">${answer['Answer']}</div>
								</div>
							`;
						});

						answersEl += '</div>'
					}

					step.html(`
						<div class="row">
							<div class="col-12 col-md-6 content-wrapper">
								${indicator}
								<div class="title">${question}</div>
								<div class="description">Select a level that best fits your current and desired maturity.</div>
								<div class="error-message">Current level and desired level need to selected.</div>
								${answersEl}
								<div class="buttons-wrapper">
									${backButton}
									<div class="icreon-button ${nextButtonClass}" data-category="${category.Category}" data-question-index="${questionIndex}">
										<div class="arrow-wrapper"></div>
										<div class="label">
											<div class="text">next</div>
										</div>
									</div>
								</div>
							</div>
							<div class="col-12 col-md-6 infographic-wrapper">
								<div class="questionnaire-categories">${categoriesList}</div>
								${infographicLevel(questionID)}
							</div>
						</div>
					`);
					step.appendTo(questionnaire);
				})
			}

		}
	});

	assessmentTool.removeClass('loading');
	levelsInteraction();
	questionnaireSteps();
}



// levels interaction
function levelsInteraction() {
	const levelsWrapper = $('.levels-wrapper');
	const infographics = $('.questionnaire .infographic-wrapper svg');

	levelsWrapper.each(function(index) {
		const wrapper = $(this);
		const currentLevels = wrapper.find('.current-level');
		const desiredLevels = wrapper.find('.desired-level');
		let lastCurrentLevel = false;
		let lastDesiredLevel = false;
		let currentLevel = 0;
		let desiredLevel = 0;

		// infographic elements
		const svg = infographics.get(index);
		const levelMeter = svg.querySelector('#level-meter');
		let levelNumbers = svg.querySelectorAll(['#number-1', '#number-2', '#number-3', '#number-4', '#number-5']);
		let levelLines = svg.querySelectorAll(['#line-1', '#line-2', '#line-3', '#line-4']);
		const desiredLevel5 = svg.querySelector('#desired-level-5');

		// set elements
		gsap.set(levelMeter, {
			transformOrigin: 'bottom',
			scaleY: 0
		});
		gsap.set(desiredLevel5, {
			transformOrigin: 'center',
			scale: 0
		});

		// current level interaction
		currentLevels.each(function(index) {
			const level = $(this);

			level.on('click', function() {
				if(wrapper.find('.current-level.is-active')) {
					wrapper.find('.current-level.is-active').removeClass('is-active');
				}
				if($(this)[0] == lastCurrentLevel[0]) {
					lastCurrentLevel = false;
					currentLevel = 0;
				} else {
					$(this).addClass('is-active');
					lastCurrentLevel = $(this);
					currentLevel = parseInt($(this).attr('data-level'));
				}

				// animate infographic level
				gsap.to(levelMeter, {
					scaleY: currentLevel * 0.2
				})

				// animate level numbers
				levelNumbers.forEach(function(number, index) {
					const value = index + 1;
					if(currentLevel >= value) {
						gsap.to(number, { fill: 'white' })
					} else {
						gsap.to(number, { fill: 'black' })
					}
				})

				// assign data to object
				assignDatatoResults({
					questionIndex: $(this).attr('data-question-index'),
					currentLevel: currentLevel,
					desiredLevel: desiredLevel,
					category: $(this).attr('data-category'),
					level: $(this).attr('data-level'),
				});
			})
		})

		// desired level interaction
		desiredLevels.each(function() {
			const level = $(this);
			level.on('click', function() {
				if(wrapper.find('.desired-level.is-active')) {
					wrapper.find('.desired-level.is-active').removeClass('is-active');
				}
				if($(this)[0] == lastDesiredLevel[0]) {
					lastDesiredLevel = false;
					desiredLevel = 0;
				} else {
					$(this).addClass('is-active');
					lastDesiredLevel = $(this);
					desiredLevel = parseInt($(this).attr('data-level'));
				}

				if(desiredLevel == 5) {
					gsap.to(desiredLevel5, {
						scale: 1
					})
					gsap.to(levelLines, {
						fill: '#EEEEEE'
					})
				} else {
					gsap.to(desiredLevel5, {
						scale: 0
					})
					levelLines.forEach(function(line, index) {
						const value = index + 1;
						if(desiredLevel == value) {
							gsap.to(line, { fill: colors.teal })
						} else {
							gsap.to(line, { fill: '#EEEEEE' })
						}
					})
				}

				// assign data to object
				assignDatatoResults({
					questionIndex: $(this).attr('data-question-index'),
					currentLevel: currentLevel,
					desiredLevel: desiredLevel,
					category: $(this).attr('data-category'),
					level: $(this).attr('data-level'),
				});

			})
		})

	})
}



// assign data to object
function assignDatatoResults(data) {
	results.Category.forEach((category) => {
		if(data.category == category.Category) {
			category.QuestionsList.forEach((question, questionIndex) => {
				if(data.questionIndex == questionIndex) {
					question.Selected = true;
					question.CurrentLevel = parseInt(data.currentLevel);
					question.DesiredLevel = parseInt(data.desiredLevel);
				}
			})
		}
	})
}



// questionnaire steps
function questionnaireSteps() {
	const questionnaireSteps = $('.questionnaire-step');
	const nextTriggers = $('.questionnaire .next');
	const prevTriggers = $('.questionnaire .prev');

	nextTriggers.each(function(index) {
		const trigger = $(this);
		trigger.on('click', function() {
			const thisTrigger = $(this);
			const thisCategory = $(this).attr('data-category');
			const questionIndex = $(this).attr('data-question-index');
			const nextIndex = index + 1;

			results.Category.forEach((category) => {
				if(category.Category == thisCategory) {
					const step = $(`.questionnaire-step[data-category="${category.Category}"]`).get(questionIndex);
					const question = category.QuestionsList[questionIndex];
					if(question.CurrentLevel > 0 && question.DesiredLevel > 0) {
						step.classList.remove('is-error');

						if(thisTrigger.hasClass('analysis-trigger')) {
							analysisInteraction();
						} else {
							animateStep(questionnaireSteps, 'next', nextIndex, nextIndex - 1);
						}

					} else {
						$(window).scrollTop(0);
						step.classList.add('is-error');
					}
				}
			})
		})
	})

	prevTriggers.each(function(index) {
		const trigger = $(this);
		trigger.on('click', function() {
			const nextIndex = index;
			animateStep(questionnaireSteps, 'prev', nextIndex, nextIndex + 1);
		})
	})
}



// analysis interaction
function analysisInteraction() {
	console.log(results);

	const rootSteps = $('.root-step');
	const infographicBaseWrapper = $('.infographic-base-wrapper');
	const contentWrapper = $('.analysis-step .content-wrapper');
	const infographicWrapper = $('.analysis-step .infographic-wrapper');

	const tabsTriggers = $('<div class="tabs-triggers analysis-tabs"></div>');
	let tabsTriggersEl = '';
	
	const tabsContent = $('<div class="tabs-content"></div>');
	let tabsContentEl = '';

	// remove infographic base because there's a bug if when
	// there's two similar SVG images
	infographicBaseWrapper.remove();
	infographicWrapper.html(infographicResults());
	
	// generate infographic results
	animateStep(rootSteps, 'next', 2, 1);

	// average numbers
	selectedCategoriesObject.forEach((category, categoryIndex) => {
		if(category.Selected) {

			let averageCurrentLevel = 0;
			let averageDesiredLevel = 0;
			let tabClass = '';
			if(categoryIndex == 0) tabClass = 'is-active';

			category.QuestionsList.forEach((question) => {
				averageCurrentLevel += question.CurrentLevel;
				averageDesiredLevel += question.DesiredLevel;
			})

			category.AverageCurrentLevel = Math.round(averageCurrentLevel/category.QuestionsList.length);
			category.AverageDesiredLevel = Math.round(averageDesiredLevel/category.QuestionsList.length);

			// make tabs
			tabsTriggersEl += `<div data-category="${category.Category}" class="tab-trigger ${tabClass}">
				${category.Category.toLowerCase()}
			</div>`;

			// make tabs content
			let graph = '';
			let buttons = '';

			if(category.AverageCurrentLevel < category.AverageDesiredLevel) {
				graph = `<div class="analysis-graph">
						<div class="current-level">
						<div class="label-wrapper">
							<div class="label">you are here</div>
						</div>
						<div class="dot"></div>
						<div class="number">${category.AverageCurrentLevel}</div>
					</div>
					<div class="desired-level">
						<div class="number">${category.AverageDesiredLevel}</div>
						<div class="dot"></div>
						<div class="label-wrapper">
							<div class="label">aiming for here</div>
						</div>
					</div>
				</div>`;
			}

			// make buttons
			if(selectedCategoriesObject.length > 1) {
				const index = categoryIndex + 1;
				if(index > 1) {
					buttons += `
						<div class="icreon-button prev" data-index="${categoryIndex}">
							<div class="arrow-wrapper"></div>
							<div class="label">
								<div class="text">prev</div>
							</div>
						</div>
					`;
				}

				if(index < selectedCategoriesObject.length) {
					buttons += `
						<div class="icreon-button next" data-index="${categoryIndex}">
							<div class="arrow-wrapper"></div>
							<div class="label">
								<div class="text">next</div>
							</div>
						</div>
					`;
				}
			}

			const levelInfo = {};
			// get levels
			results.Levels.forEach((level) => {
				if(level.Step == category.AverageCurrentLevel) {
					levelInfo.title = level.Title;
					levelInfo.description = level.Description;
				}
			})

			tabsContentEl += `
				<div class="tab-content" data-category="${category.Category}">
					<div class="title">
						<div class="level">level ${category.AverageCurrentLevel}</div>
						<div class="text">${levelInfo.title}</div>
					</div>
					<div class="description">${levelInfo.description}</div>
					${graph}
					<div class="buttons-wrapper">
						${buttons}
					</div>
				</div>
			`;
		}

		// update results svg based on data
		const categoryName = category.Category.replace(/\s/g, '-');
		const categorySelector = document.querySelector(`.infographic-results-wrapper #${categoryName}`);
		if(categorySelector) {
			const categorySVG = categorySelector.parentElement;
			categorySVG.classList.add('is-enabled');

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
				transformOrigin: 'center',
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

		} {
			console.log('no element');
		}

	});

	tabsTriggers.html(tabsTriggersEl);
	tabsTriggers.prependTo(infographicWrapper);
	tabsContent.html(tabsContentEl);
	tabsContent.appendTo(contentWrapper);
	tabsInteraction();
}



// tabs interaction
function tabsInteraction() {
	const tabs = $('.tabs');
	const infographic = document.querySelector('.analysis-step .infographic-wrapper svg');

	if(tabs) {
		tabs.each(function() {
			const tab = $(this);
			const triggers = tab.find('.tab-trigger');
			const contents = tab.find('.tab-content');

			triggers.each(function(index) {
				const trigger = $(this);
				trigger.on('click', function() {
					if(!$(this).hasClass('is-active')) {
						const lastItem = tab.find('.tab-trigger.is-active');
						const lastIndex = triggers.index(lastItem);
						$(this).addClass('is-active');

						animateSVG($(this).attr('data-category'), lastItem.attr('data-category'));
						animateTrigger(index);

						if(index > lastIndex) {
							animateStep(contents, 'next', index, lastIndex);
						} else {
							animateStep(contents, 'prev', index, lastIndex);
						}
					}
				})
			})

			const nextTriggers = tab.find('.next');
			const prevTriggers = tab.find('.prev');

			prevTriggers.each(function() {
				const index = parseInt($(this).attr('data-index'));
				$(this).on('click', function() {
					const nextIndex = index - 1;
					const nextTab = triggers[nextIndex];
					const lastTab = triggers[nextIndex + 1];

					animateSVG(nextTab.getAttribute('data-category'), lastTab.getAttribute('data-category'));
					animateTrigger(nextIndex);
					animateStep(contents, 'prev', nextIndex, nextIndex + 1);
				})
			})

			nextTriggers.each(function() {
				const index = parseInt($(this).attr('data-index'));
				$(this).on('click', function() {
					const nextIndex = index + 1;
					const nextTab = triggers[nextIndex];
					const lastTab = triggers[nextIndex - 1];

					animateSVG(nextTab.getAttribute('data-category'), lastTab.getAttribute('data-category'));
					animateTrigger(nextIndex);
					animateStep(contents, 'next', nextIndex, nextIndex - 1);
				})
			})

			function animateTrigger(index) {
				tab.find('.tab-trigger.is-active').removeClass('is-active');
				triggers[index].classList.add('is-active');
			}

			// animate svg
			let initialCategory = selectedCategoriesObject[0].Category;
			initialCategory = initialCategory.replace(/\s/g, '-');
			const initialSVGCategory = infographic.querySelector(`#${initialCategory}`);
			if(initialSVGCategory) {
				initialSVGCategory.parentElement.classList.add('is-active');
			}

			function animateSVG(nextCategory, lastCategory) {
				const next = nextCategory.replace(/\s/g, '-');
				const last = lastCategory.replace(/\s/g, '-');
				console.log(nextCategory, lastCategory);

				const nextSVG = infographic.querySelector(`#${next}`)
				const lastSVG = infographic.querySelector(`#${last}`)
				console.log(nextSVG, lastSVG);
				nextSVG.parentElement.classList.add('is-active');
				lastSVG.parentElement.classList.remove('is-active');
			}

		})
	}
}



// animate step
function animateStep(array, type, nextIndex, lastIndex) {
	const tl = gsap.timeline({
		onStart: () => {
			$('html, body').animate({
				scrollTop: assessmentTool.offset().top
			}, {
				duration: 600,
				easing: 'swing'
			});
		}
	});

	if(nextIndex < array.length) {
		tl
			.to(array[lastIndex], {
				x: () => {
					return (type == 'next') ?
						transition.x * -1 :
						transition.x;
				},
				opacity: 0,
				ease: 'power2.in'
			})
			.set(array[nextIndex], {
				opacity: 0,
				display: 'block',
				x: () => {
					return (type == 'next') ?
						transition.x :
						transition.x * -1;
				},
			})
			.set(array[lastIndex], {
				display: 'none',
			})
			.to(array[nextIndex], {
				opacity: 1,
				x: 0,
				ease: 'power2.out'
			})
	}
}



// form validation
formValidation();
function formValidation() {
	const form = $('#assessment-form');
	if(form) {
		ufValidation('#assessment-form', {
			onError: () => {
				console.log('oops, theres an error');
			},
			onSuccess: () => {
				results.Email = form.find('#email').val();
				results.FirstName = form.find('#first-name').val();
				results.LastName = form.find('#last-name').val();

				// show direct results
				const lastInfographic = $('.analysis-step .infographic-results-wrapper');
				assessmentTool.addClass('loading');
				lastInfographic.remove();

				// generate results
				generateResults(assessmentToolResults, results);
				setTimeout(() => {
					assessmentTool.removeClass('loading');
					animateStep(assessmentTool.children(), 'next', 1, 0);
				}, 300);
			}
		})
	}
}
