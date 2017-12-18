var app = {
    API_VERSION: '5.69',
    VIEWER_DEVICE_MOBILE: 'mobile',
    RESULT_IMAGE_NAMES: [
        '0-3.png',
        '1-3.png',
        '2-3.png',
        '3-3.png'
    ],

    elements: {
        installAppButton: document.getElementById('btn-show-install-page'),
        submitQuestionButton: document.getElementById('btn-question-submit'),
        tryAgainButton: document.getElementById('btn-try-again'),
        shareButton: document.getElementById('btn-share'),
        shareWrapper: document.getElementById('wrapper-sharing'),
        headerTitle: document.getElementById('text-title-header'),
        examProgressTitle: document.getElementById('text-title-test-progress'),
        resultScores: document.getElementById('text-score'),
        resultMaxScores: document.getElementById('text-max-score')
    },
    pages: {
        install: document.getElementById('page-install'),
        exam: document.getElementById('page-test'),
        result: document.getElementById('page-results')
    },
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

    nextQuestionEventListener: function (event) {
        event.preventDefault();
        app.nextQuestion(app.testStatus.self);
    },

    submitTestEventListener: function (event) {
        event.preventDefault();
        app.showResults();
    },

    scoreCounterListener: function (event) {
        event.preventDefault();

        var answer = document.querySelector('input[type=radio]:checked');
        var rightAnswerId = app.testStatus.self.questions[app.testStatus.questionNumber - 1].rightAnswerId;
        if (answer && answer.item.id === rightAnswerId) {
            app.testStatus.userScores++;
        }
    },

    tryAgainTestEventListener: function (event) {
        event.preventDefault();
        app.show(app.pages.exam);
    },
    
    shareMobileEventListener: function (event) {
        event.preventDefault();
        VK.callMethod('shareBox', app.appLink, app.imageUrl, app.pages.exam.item.title);
    },

    startTest: function (test) {
        app.testStatus.maxQuestion = test.questions.length;
        app.testStatus.questionNumber = 0;
        app.testStatus.self = test;
        app.testStatus.userScores = 0;

        app.elements.headerTitle.innerHTML = 'Тест: ' + test.title;
        app.elements.submitQuestionButton.style.display = 'inline-block';
        app.elements.submitQuestionButton.innerHTML = 'Далее';

        app.elements.submitQuestionButton.addEventListener('click', app.scoreCounterListener);
        app.elements.submitQuestionButton.addEventListener('click', app.nextQuestionEventListener);

        app.nextQuestion(test);
    },

    nextQuestion: function (test) {
        app.pages.exam.innerHTML = '';
        app.pages.exam.appendChild(
            app.renderQuestion(test.questions[app.testStatus.questionNumber])
        );
        app.testStatus.questionNumber++;

        if (app.testStatus.questionNumber === app.testStatus.maxQuestion) {
            var btnSubmit = app.elements.submitQuestionButton;
            btnSubmit.innerHTML = 'Отправить';
            btnSubmit.removeEventListener('click', app.nextQuestionEventListener);
            btnSubmit.addEventListener('click', app.submitTestEventListener);
        }
        app.updateCounters();
    },

    showResults: function () {
        app.elements.resultScores.innerHTML = app.testStatus.userScores;
        app.elements.resultMaxScores.innerHTML = app.testStatus.maxQuestion;

        app.elements.submitQuestionButton.removeEventListener('click', app.submitTestEventListener);
        app.elements.submitQuestionButton.removeEventListener('click', app.scoreCounterListener);

        app.show(app.pages.result);
    },

    show: function (page) {
        app.hideAll();
        page.style.display = 'block';

        switch (page) {
            case app.pages.install:
                app.elements.installAppButton.href = 'https://vk.com/add_community_app.php?aid=' + app.appId;
                break;

            case app.pages.exam:
                app.startTest(page.item);
                app.elements.examProgressTitle.style.display = 'inline-block';
                app.elements.submitQuestionButton.style.display = 'inline-block';
                break;

            case app.pages.result:
                app.elements.submitQuestionButton.style.display = 'none';
                app.elements.examProgressTitle.style.display = 'none';
                app.elements.tryAgainButton.addEventListener('click', app.tryAgainTestEventListener);
                
                app.imageUrl = location.origin + location.pathname + 'images/'
                    + app.RESULT_IMAGE_NAMES[app.testStatus.userScores];

                if (app.viewerDevice && app.viewerDevice === app.VIEWER_DEVICE_MOBILE) {
                    app.elements.shareButton.addEventListener('click', app.shareMobileEventListener);
                } else {
                    var shareOption = {
                        url: app.appLink,
                        title: app.pages.exam.item.title,
                        image: app.imageUrl
                    };

                    app.elements.shareWrapper.innerHTML = VK.Share.button(shareOption, {
                        type: 'button_nocount',
                        text: 'Поделиться'
                    });
                }
                break;
        }
    },

    hideAll: function () {
        for (var page in app.pages) {
            app.hide(app.pages[page]);
        }
    },

    hide: function (page) {
        page.style.display = 'none';

        switch (page) {
            case app.pages.result:
                app.elements.tryAgainButton.removeEventListener('click', app.tryAgainTestEventListener);

                if (app.viewerDevice && app.viewerDevice === app.VIEWER_DEVICE_MOBILE) {
                    app.elements.shareButton.removeEventListener('click', app.shareMobileEventListener);
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
        app.elements.examProgressTitle.innerHTML = 'Вопрос <b>'
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
        app.pages.exam.item = testData;

        if (app.groupId == 0) {
            app.show(app.pages.install);
        } else {
            app.show(app.pages.exam);
        }
    }
};

window.addEventListener('load', function () {
    app.init();
});

var testData = {
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
