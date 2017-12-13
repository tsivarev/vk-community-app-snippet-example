var app = {
    API_VERSION: '5.69',
    VIEWER_DEVICE_MOBILE: 'mobile',
    ELEMENTS: {
        INSTALL_APP_BUTTON: document.getElementById('btn-show-install-page'),
        SUBMIT_QUESTION_BUTTON: document.getElementById('btn-question-submit'),
        TRY_AGAIN_BUTTON: document.getElementById('btn-try-again'),
        SHARE_BUTTON: document.getElementById('btn-share'),
        HEADER_TITLE: document.getElementById('txt-title-header'),
        EXAM_PROGRESS_TITLE: document.getElementById('txt-title-exam-progress'),
        RESULT_SCORES: document.getElementById('txt-score'),
        RESULT_MAX_SCORES: document.getElementById('txt-max-score')
    },
    PAGES: {
        INSTALL: document.getElementById('page-install'),
        EXAM: document.getElementById('page-exam'),
        RESULT: document.getElementById('page-results')
    },

    appId: 0,
    groupId: 0,

    examStatus: {
        self: null,
        questionNumber: 0,
        maxQuestion: 0,
        userAnswers: []
    },

    btnSubmitHandlers: {
        nextQuestionEvent: function (event) {
            event.preventDefault();
            app.nextQuestion(app.examStatus.self);
        },
        submitExamEvent: function (event) {
            event.preventDefault();
            app.showResults();
        },
        countScore: function (event) {
            event.preventDefault();

            var answer = document.querySelector('input[type=radio]:checked');
            app.examStatus.userAnswers.push(
                answer == null ? null : answer.item
            );
        }
    },

    startExam: function startExam(exam) {
        app.examStatus.maxQuestion = exam.questions.length;
        app.examStatus.questionNumber = 0;
        app.examStatus.self = exam;
        app.examStatus.userAnswers = [];

        app.ELEMENTS.HEADER_TITLE.innerHTML = 'Экзамен: ' + exam.title;
        app.ELEMENTS.SUBMIT_QUESTION_BUTTON.style.display = 'inline-block';
        app.ELEMENTS.SUBMIT_QUESTION_BUTTON.innerHTML = 'Далее';

        app.ELEMENTS.SUBMIT_QUESTION_BUTTON.addEventListener('click', app.btnSubmitHandlers.countScore);
        app.ELEMENTS.SUBMIT_QUESTION_BUTTON.addEventListener('click', app.btnSubmitHandlers.nextQuestionEvent);

        app.nextQuestion(exam);
    },

    nextQuestion: function (exam) {
        app.PAGES.EXAM.innerHTML = '';
        app.PAGES.EXAM.appendChild(
            app.renderQuestion(exam.questions[app.examStatus.questionNumber])
        );

        app.examStatus.questionNumber++;

        if (app.examStatus.questionNumber === app.examStatus.maxQuestion) {
            var btnSubmit = app.ELEMENTS.SUBMIT_QUESTION_BUTTON;
            btnSubmit.innerHTML = 'Отправить';
            btnSubmit.removeEventListener('click', app.btnSubmitHandlers.nextQuestionEvent);
            btnSubmit.addEventListener('click', app.btnSubmitHandlers.submitExamEvent);
        }
        app.updateCounters();
    },

    showResults: function () {
        var userResult = 0;

        app.examStatus.self.questions.forEach(function (question) {

            if (question.correctAnswerId === app.examStatus.userAnswers.shift().id){
                userResult++;
            }
        });

        sessionStorage.setItem('testResult', userResult);
        app.ELEMENTS.RESULT_SCORES.innerHTML = userResult;
        app.ELEMENTS.RESULT_MAX_SCORES.innerHTML =  app.examStatus.maxQuestion;

        app.ELEMENTS.SUBMIT_QUESTION_BUTTON.removeEventListener('click', app.btnSubmitHandlers.submitExamEvent);
        app.ELEMENTS.SUBMIT_QUESTION_BUTTON.removeEventListener('click', app.btnSubmitHandlers.countScore);

        app.show(app.PAGES.RESULT);
    },

    show: function (page) {
        app.hideAll();
        page.style.display = 'block';

        switch (page){
            case app.PAGES.INSTALL:
                app.ELEMENTS.EXAM_PROGRESS_TITLE.innerHTML = 'Вопрос <b>1</b> из <b>1</b>';
                app.ELEMENTS.SUBMIT_QUESTION_BUTTON.style.display = 'inline-block';
                break;

            case app.PAGES.EXAM:
                app.startExam(page.item);
                app.ELEMENTS.EXAM_PROGRESS_TITLE.style.display = 'inline-block';
                app.ELEMENTS.SUBMIT_QUESTION_BUTTON.style.display = 'inline-block';
                break;

            case app.PAGES.RESULT:
                app.ELEMENTS.SUBMIT_QUESTION_BUTTON.style.display = 'none';
                app.ELEMENTS.EXAM_PROGRESS_TITLE.style.display = 'none';
                break;
        }

        if (page === app.PAGES.EXAM){

        } else if (page === app.PAGES.INSTALL) {

        }
    },

    hideAll: function () {
        for(var page in app.PAGES){
            app.PAGES[page].style.display = 'none';
        }
    },

    showInstallPage: function (event) {
        event.preventDefault();
        window.open('https://vk.com/add_community_app.php?aid=' + app.appId, '_blank');
    },

    getUrlParameter: function (name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');

        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);

        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    },

    updateCounters: function () {
        app.ELEMENTS.EXAM_PROGRESS_TITLE.innerHTML = 'Вопрос <b>'
            + app.examStatus.questionNumber + '</b> из <b>' + app.examStatus.maxQuestion + '</b>'
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

        question.answers.forEach(function (answer, i) {
            var choiceListItemElem = document.createElement('li');

            var choiceLabelElem = document.createElement('label');
            choiceLabelElem.for = 'answer-' + i;

            var choiceInputElem = document.createElement('input');
            choiceInputElem.type = 'radio';
            choiceInputElem.id = 'answer-' + i;
            choiceInputElem.name = 'question-' + question.id;
            choiceInputElem.item = answer;

            var choiceTextNode = document.createTextNode(answer.value);

            choiceLabelElem.appendChild(choiceInputElem);
            choiceLabelElem.appendChild(choiceTextNode);
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

        VK.init(null, null, app.API_VERSION);

        sessionStorage.setItem('viewerId', app.getUrlParameter('viewer_id'));
        app.ELEMENTS.INSTALL_APP_BUTTON.addEventListener('click', app.showInstallPage);
        app.ELEMENTS.TRY_AGAIN_BUTTON.addEventListener('click', function (event) {
            event.preventDefault();
            app.show(app.PAGES.EXAM);
        });

        app.ELEMENTS.SHARE_BUTTON.addEventListener('click', function (event) {
            event.preventDefault();

            var viewerDevice = app.getUrlParameter('viewer_device');
            var resultImages = [
                '0-3.png',
                '1-3.png',
                '2-3.png',
                '3-3.png'
            ];
            var imageUrl = location.origin + location.pathname + '/images/'
                + resultImages[sessionStorage.getItem('testResult')];

            if (viewerDevice && viewerDevice === app.VIEWER_DEVICE_MOBILE) {
                VK.callMethod('shareBox',
                    'https://vk.com/app' + app.appId,
                    imageUrl,
                    '');
            } else {
                var appLink = 'https://vk.com/app' + app.appId + '_-' + app.groupId;

                var requestData = {
                    'owner_id': sessionStorage.getItem('viewerId'),
                    'message': '',
                    'attachments': imageUrl + ',' + appLink
                };

                VK.api('wall.post', requestData);
            }
        });
        app.PAGES.EXAM.item = mathExam;

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

var mathExam = {
    title: "Математика",
    questions: [
        {
            id: 1,
            title: "Сколько будет 2х2?",
            correctAnswerId: 1,
            answers: [
                {
                    id: 1,
                    value: "4"
                },
                {
                    id: 2,
                    value: "Кот"
                }
            ]
        },
        {
            id: 2,
            title: "Как можно найти корни квадратного уравнения?",
            correctAnswerId: 1,
            answers: [
                {
                    id: 1,
                    value: "По теореме Виета"
                },
                {
                    id: 2,
                    value: "Умножить коэффициенты уравнения"
                },
                {
                    id: 3,
                    value: "Сложить коэффициенты уравнения"
                }
            ]
        },
        {
            id: 3,
            title: "Каким способом можно вычислить вторую производную функции f(x)=x*x ?",
            correctAnswerId: null,
            answers: [
                {
                    id: 1,
                    value: "Лечь на пол и заплакать"
                },
                {
                    id: 2,
                    value: "Поделить функцию на ноль"
                },
                {
                    id: 3,
                    value: "Спросить у мудреца под куполом офиса ВКонтакте"
                },
                {
                    id: 4,
                    value: "Взять производную от 2x и выбросить ее"
                }
            ]
        }
    ]
};