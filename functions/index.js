             //*********************¨¨¨¨¨¨¨¨¨¨¨by salma_mao¨¨¨¨¨¨¨¨¨¨¨**********************//

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp({credential: admin.credential.applicationDefault()});
db = admin.firestore();

/*
  function returns list of questions
*/
exports.getQuestionsList = functions.https.onRequest((request, response) => {
    let results = [];
    db.collection('questions').get()
        .then(questionsSnapchot => {questionsSnapchot.forEach(doc =>  {
             let question = doc.data();
             question.id = doc.id;
             results.push(question);
          });

        response.send(responseDataSuccess(results));
        }).catch(err => {
            response.send(responseDataFailure());
        });
});

/*
  function validates the answer of a specific question
*/
exports.validateAnswer = functions.https.onRequest((request, response) => {
    let questionId = request.query.id;
    let answer = request.query.answer;

    db.collection('questions').doc(questionId).get()
        .then(questionSnapshot => {
            if (!questionSnapshot.exists) {
                throw new Error("Question not found");
            } else {
                if (questionSnapshot.get('rightAnswer') === answer) {
                    response.send(responseDataSuccess());
                } else {
                    throw new Error("It is not the right answer!");
                }
            }
        })
        .catch(err => {
            response.send(responseDataFailure(400, err));
        });
});

/*
 data response returned successfully
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
 data response returned with failure
*/
function responseDataFailure(statusCode = 404, error = "Data not found") {
    return {
        'result': 'nOK',
        'statusCode': statusCode,
        'message': error,
    };
}