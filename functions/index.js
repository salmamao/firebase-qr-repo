//*********************¨¨¨¨¨¨¨¨¨¨¨by salma_mao¨¨¨¨¨¨¨¨¨¨¨**********************//

const functions = require('firebase-functions');
const admin = require('firebase-admin');

//Handle Cross-origin resource sharing
const cors = require('cors')({origin: true});

admin.initializeApp();
db = admin.firestore();

/*
  Function returns list of questions
*/
exports.getQuestionsList = functions.https.onRequest((request, response) => {
    return cors(request, response, () => {
        let results = [];
        db.collection('questions').get().then(questionsSnapchot => {
            questionsSnapchot.forEach(doc => {
                let question = doc.data();
                question.id = doc.id;
                results.push(question);
            });
            response.send(responseDataSuccess(results));
        }).catch(err => {
            response.send(responseDataFailure());
        });
    });
});

/*
  Function returns a specific question by id
*/
exports.getQuestion = functions.https.onRequest((request, response) => {
    return cors(request, response, () => {
        let questionId = request.query.id;

        db.collection('questions').doc(questionId).get().then(questionSnapshot => {
            if (!questionSnapshot.exists) {
                response.send(responseDataFailure("Question not found"));
            } else {
                let question = questionSnapshot.data();
                let responseData = [{
                    content: question.content,
                    theme: question.theme,
                    id: questionSnapshot.id
                }];
                response.send(responseDataSuccess(responseData));
            }
        }).catch(err => {
            response.send(responseDataFailure(err, 400));
        });
    });
});

/*
  Function validates the answer of a specific question
*/
exports.validateAnswer = functions.https.onRequest((request, response) => {
    return cors(request, response, () => {
        let questionId = request.query.id;
        let answer = request.query.answer;
        let answerMessage = "";

        db.collection('questions').doc(questionId).get().then(questionSnapshot => {
            if (!questionSnapshot.exists) {
                response.send(responseDataFailure("Question not found"));
            } else {
                if (eval(questionSnapshot.get('rightAnswer')) === eval(answer)) {
                    answerMessage = "Bravo! C'est la bonne réponse.";
                } else {
                    answerMessage = "ZUT!  Échoué.";
                }
                response.send(responseDataSuccess([answerMessage]));
            }
        }).catch(err => {
            response.send(responseDataFailure(err, 400));
        });
    });
});

/*
  Data response returned successfully
*/
function responseDataSuccess(data = []) {
    return {
        'data': data,
        'result': 'OK',
        'statusCode': '200',
        'numberResult': data.length,
        'message': 'Data returned successfully',
    };
}

/*
  Data response returned with failure
*/
function responseDataFailure(error = "Data not found", statusCode = 404) {
    return {
        'result': 'nOK',
        'statusCode': statusCode,
        'message': error,
    };
}