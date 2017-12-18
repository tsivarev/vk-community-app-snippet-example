var app = {
    API_VERSION: '5.69',
    VIEWER_DEVICE_MOBILE: 'mobile',
    ELEMENTS: {
        INSTALL_APP_BUTTON: document.getElementById('btn-show-install-page'),
        SUBMIT_QUESTION_BUTTON: document.getElementById('btn-question-submit'),
        TRY_AGAIN_BUTTON: document.getElementById('btn-try-again'),
        SHARE_BUTTON: document.getElementById('btn-share'),
        SHARE_WRAPPER: document.getElementById('wrapper-sharing'),
        HEADER_TITLE: document.getElementById('text-title-header'),
        EXAM_PROGRESS_TITLE: document.getElementById('text-title-test-progress'),
        RESULT_SCORES: document.getElementById('text-score'),
        RESULT_MAX_SCORES: document.getElementById('text-max-score')
    },
    PAGES: {
        INSTALL: document.getElementById('page-install'),
        EXAM: document.getElementById('page-test'),
        RESULT: document.getElementById('page-results')
    },
    RESULT_IMAGE_NAMES: [
        '0-3.png',
        '1-3.png',
        '2-3.png',
        '3-3.png'
    ],

    appId: 0,
    groupId: 0,
    viewerDevice: null,
    appLink: null,
    imageUrl: null,

    testStatus: {
        self: null,
        questionNumber: 0,
        maxQuestion: 0,
        userScores: 0
    },

    btnHandlers: {
        nextQuestionEvent: function (event) {
            event.preventDefault();
            app.nextQuestion(app.testStatus.self);
        },
        submitTestEvent: function (event) {
            event.preventDefault();
            app.showResults();
        },
        countScore: function (event) {
            event.preventDefault();

            var answer = document.querySelector('input[type=radio]:checked');
            var rightAnswerId = app.testStatus.self.questions[app.testStatus.questionNumber - 1].rightAnswerId;
            if (answer && answer.item.id === rightAnswerId) {
                app.testStatus.userScores++;
            }
        },
        tryAgainTest: function (event) {
            event.preventDefault();
            app.show(app.PAGES.EXAM);
        },
        shareMobile: function (event) {
            event.preventDefault();
            VK.callMethod('shareBox', app.appLink, app.imageUrl, app.PAGES.EXAM.item.title);
        }
    },

    startTest: function (test) {
        app.testStatus.maxQuestion = test.questions.length;
        app.testStatus.questionNumber = 0;
        app.testStatus.self = test;
        app.testStatus.userScores = 0;

        app.ELEMENTS.HEADER_TITLE.innerHTML = 'Тест: ' + test.title;
        app.ELEMENTS.SUBMIT_QUESTION_BUTTON.style.display = 'inline-block';
        app.ELEMENTS.SUBMIT_QUESTION_BUTTON.innerHTML = 'Далее';

        app.ELEMENTS.SUBMIT_QUESTION_BUTTON.addEventListener('click', app.btnHandlers.countScore);
        app.ELEMENTS.SUBMIT_QUESTION_BUTTON.addEventListener('click', app.btnHandlers.nextQuestionEvent);

        app.nextQuestion(test);
    },

    nextQuestion: function (test) {
        app.PAGES.EXAM.innerHTML = '';
        app.PAGES.EXAM.appendChild(
            app.renderQuestion(test.questions[app.testStatus.questionNumber])
        );
        app.testStatus.questionNumber++;

        if (app.testStatus.questionNumber === app.testStatus.maxQuestion) {
            var btnSubmit = app.ELEMENTS.SUBMIT_QUESTION_BUTTON;
            btnSubmit.innerHTML = 'Отправить';
            btnSubmit.removeEventListener('click', app.btnHandlers.nextQuestionEvent);
            btnSubmit.addEventListener('click', app.btnHandlers.submitTestEvent);
        }
        app.updateCounters();
    },

    showResults: function () {
        app.ELEMENTS.RESULT_SCORES.innerHTML = app.testStatus.userScores;
        app.ELEMENTS.RESULT_MAX_SCORES.innerHTML = app.testStatus.maxQuestion;

        app.ELEMENTS.SUBMIT_QUESTION_BUTTON.removeEventListener('click', app.btnHandlers.submitTestEvent);
        app.ELEMENTS.SUBMIT_QUESTION_BUTTON.removeEventListener('click', app.btnHandlers.countScore);

        app.show(app.PAGES.RESULT);
    },

    show: function (page) {
        app.hideAll();
        page.style.display = 'block';

        switch (page) {
            case app.PAGES.INSTALL:
                app.ELEMENTS.INSTALL_APP_BUTTON.href = 'https://vk.com/add_community_app.php?aid=' + app.appId;
                break;

            case app.PAGES.EXAM:
                app.startTest(page.item);
                app.ELEMENTS.EXAM_PROGRESS_TITLE.style.display = 'inline-block';
                app.ELEMENTS.SUBMIT_QUESTION_BUTTON.style.display = 'inline-block';
                break;

            case app.PAGES.RESULT:
                app.ELEMENTS.SUBMIT_QUESTION_BUTTON.style.display = 'none';
                app.ELEMENTS.EXAM_PROGRESS_TITLE.style.display = 'none';
                app.ELEMENTS.TRY_AGAIN_BUTTON.addEventListener('click', app.btnHandlers.tryAgainTest);
                
                app.imageUrl = location.origin + location.pathname + 'images/'
                    + app.RESULT_IMAGE_NAMES[app.testStatus.userScores];

                if (app.viewerDevice && app.viewerDevice === app.VIEWER_DEVICE_MOBILE) {
                    app.ELEMENTS.SHARE_BUTTON.addEventListener('click', app.btnHandlers.shareMobile);
                } else {
                    var shareOption = {
                        url: app.appLink,
                        title: app.PAGES.EXAM.item.title,
                        image: app.imageUrl
                    };

                    app.ELEMENTS.SHARE_WRAPPER.innerHTML = VK.Share.button(shareOption, {
                        type: 'button_nocount',
                        text: 'Поделиться'
                    });
                }
                break;
        }
    },

    hideAll: function () {
        for (var page in app.PAGES) {
            app.hide(app.PAGES[page]);
        }
    },

    hide: function (page) {
        page.style.display = 'none';

        switch (page) {
            case app.PAGES.RESULT:
                app.ELEMENTS.TRY_AGAIN_BUTTON.removeEventListener('click', app.btnHandlers.tryAgainTest);

                if (app.viewerDevice && app.viewerDevice === app.VIEWER_DEVICE_MOBILE) {
                    app.ELEMENTS.SHARE_BUTTON.removeEventListener('click', app.btnHandlers.shareMobile);
                }
                break;
        }
    },

    getUrlParameter: function (name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');

        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);

        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    },

    updateCounters: function () {
        app.ELEMENTS.EXAM_PROGRESS_TITLE.innerHTML = 'Вопрос <b>'
            + app.testStatus.questionNumber + '</b> из <b>' + app.testStatus.maxQuestion + '</b>'
    },

    renderQuestion: function (question) {
        var mainContainerElem = document.createElement('div');
        mainContainerElem.classList.add('question');
        mainContainerElem.id = 'question-' + question.id;

        var questionTitleElem = document.createElement('h3');
        questionTitleElem.classList.add('question-title');
        questionTitleElem.innerHTML = question.title;

        var choiceListElem = document.createElement('ul');
        choiceListElem.classList.add('question-choice');

        question.answers.forEach(function (answer) {
            var choiceListItemElem = document.createElement('li');
            var choiceLabelElem = document.createElement('label');

            var choiceInputElem = document.createElement('input');
            choiceInputElem.type = 'radio';
            choiceInputElem.name = 'question-' + question.id;
            choiceInputElem.item = answer;
            choiceInputElem.classList.add('input-radio');

            var choiceCustomInputElem = document.createElement('span');
            choiceCustomInputElem.classList.add('input-radio-custom');

            var choiceTextElem = document.createElement('span');
            choiceTextElem.classList.add('input-radio-text');
            choiceTextElem.innerText = answer.value;

            choiceLabelElem.appendChild(choiceInputElem);
            choiceLabelElem.appendChild(choiceCustomInputElem);
            choiceLabelElem.appendChild(choiceTextElem);
            choiceListItemElem.appendChild(choiceLabelElem);
            choiceListElem.appendChild(choiceListItemElem);
        });

        mainContainerElem.appendChild(questionTitleElem);
        mainContainerElem.appendChild(choiceListElem);

        return mainContainerElem;
    },

    init: function () {
        app.appId = app.getUrlParameter('api_id');
        app.groupId = app.getUrlParameter('group_id');
        app.viewerDevice = app.getUrlParameter('viewer_device');
        app.appLink = 'https://vk.com/app' + app.appId + '_-' + app.groupId;

        VK.init(null, null, app.API_VERSION);

        sessionStorage.setItem('viewerId', app.getUrlParameter('viewer_id'));
        app.PAGES.EXAM.item = memologyTest;

        if (app.groupId == 0) {
            app.show(app.PAGES.INSTALL);
        } else {
            app.show(app.PAGES.EXAM);
        }
    }
};

window.addEventListener('load', function () {
    app.init();
});

var memologyTest = {
    title: 'Мемология',
    questions: [
        {
            id: 1,
            title: 'Знаете ли вы, кто придумал мемы?',
            rightAnswerId: 1,
            answers: [
                {
                    id: 1,
                    value: 'Да'
                },
                {
                    id: 2,
                    value: 'Нет'
                }
            ]
        },
        {
            id: 2,
            title: 'Скидывали ли вы мемы своим друзьям ВКонтакте?',
            rightAnswerId: 1,
            answers: [
                {
                    id: 1,
                    value: 'Да'
                },
                {
                    id: 2,
                    value: 'Нет'
                }
            ]
        },
        {
            id: 3,
            title: 'Где купить мемы?',
            rightAnswerId: null,
            answers: [
                {
                    id: 1,
                    value: 'На базаре'
                },
                {
                    id: 2,
                    value: 'В пятерочке'
                },
                {
                    id: 3,
                    value: 'Их дают вместе со стикерами'
                },
                {
                    id: 4,
                    value: 'У Бога мемов'
                }
            ]
        }
    ]
};
