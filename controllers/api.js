const ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
const { taCredentials } = require('../config');
const { fetchTweets } = require('../models/api');

// const ta = new ToneAnalyzerV3({
//     username: process.env.username,
//     password: process.env.password,
//     version_date: process.env.version_date
// });

const ta = new ToneAnalyzerV3(taCredentials)

exports.getSpeech = (req, res, next) => {
    const { twitter_handle } = req.query;
    fetchTweets(twitter_handle, (err, tweets, profileImgURL) => {
        if(err) next(err);
        else {
            ta.tone({
                tone_input: tweets,
                content_type: 'text/plain'
            }, (err, watsonData) => {
                if(err) {
                    console.log(err);
                    res.send({status: 500});
                }
                const emotionalTweets = watsonData.sentences_tone.reduce((acc, sentence) => {
                    sentence.tones.forEach(tone => {
                        if (acc[tone] === undefined) acc[tone.tone_name] = {text: sentence.text, score: tone.score};
                        else if (acc[tone].score < tone.score) acc[tone.tone_name] = {text: sentence.text, score: tone.score};
                    });
                    return acc;
                }, {});
                const emotionalTweetsArr = Object.keys(emotionalTweets).map(tone => {
                    return {
                        tone: tone,
                        text: emotionalTweets[tone].text
                    };
                });
                console.log(emotionalTweetsArr);
                res.render('user.ejs', { emotionalTweetsArr, profileImgURL });
            });
        };
    });
};