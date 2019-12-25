//by salma_mao

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp({credential: admin.credential.applicationDefault()});
db = admin.firestore();

/*
 this function gets list of questions
*/
exports.getQuestionslist = functions.https.onRequest((request, response) => {
    let results = [];
    db.collection('questions').get()
        .then(questionsSnapchot => {questionsSnapchot.forEach(doc =>  {
             let question = doc.data();
             question.id = doc.id;
             results.push(question);
          });
            response.send(results);
        }).catch(err => {
        response.status(404).send(err);
    });
});

/*
 this function validates the answer of a specific question
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
                    response.status(200).send(questionSnapshot.rightAnswer);
                } else {
                    throw new Error("It is not the right answer!");
                }
            }
        })
        .catch(err => {
            console.log(err);
            response.send(err).status(400);
        });
});