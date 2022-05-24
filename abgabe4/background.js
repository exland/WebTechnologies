"use strict";
const { count } = require('console');
// In this file, we write a background script to convert documents to embeddings
// We use the word2vec library for the computation of the word vectors
const fs = require('fs');
const { exit } = require('process');
const w2v = require('word2vec');

function preprocess(originalString) 
{
    // rewrite more user friendly? 
    
    var regex_tags = /(<([^>]+)>)/ig;
    var regex_space = /\s+/ig;
    var regex_special_chars = /[^A-Za-z 0-9]/ig;
    var tmp = originalString.replace(regex_tags, "")
    tmp = tmp.replace(regex_special_chars, " ")
    tmp = tmp.replace(regex_space, " ")
    return tmp.toLowerCase() + "\n"
}

var preprossed = {}

var preprossed2 = {}


function createCorpusQ(inputFile, outputFile) 
{
    console.log("Creating corpus Questions")
    try
    {
        fs.unlinkSync(outputFile)
        //file removed
    }
    catch(err)
    {
        console.error(err)
    }
    var data =  JSON.parse(fs.readFileSync(inputFile, 'utf-8'))
    var logger = fs.createWriteStream(outputFile, 
    {
        flags: 'a' // 'a' means appending (old data will be preserved)
    })
    for(var i in data)
    {
        var str =  preprocess(data[i].Body)
        preprossed[i] = str;
        logger.write(str) // append string to your file
    }
    logger.end();

    console.log("Creating word2vec Questions")

    w2v.word2vec("data/corpusQ.txt", "data/word_vectorsQ.txt",{ size: 100 },() => 
    {
        createCorpusA("data/Answers.json", "data/corpusA.txt")
    })

   


    
}

function createCorpusA(inputFile, outputFile) 
{
    console.log("Creating corpus Answers")

    try
    {
        fs.unlinkSync(outputFile)
        //file removed
    }
    catch(err)
    {
        console.error(err)
    }
    var data =  JSON.parse(fs.readFileSync(inputFile, 'utf-8'))
    var logger = fs.createWriteStream(outputFile, 
    {
        flags: 'a' // 'a' means appending (old data will be preserved)
    })
    for(var i in data)
    {
        var str =  preprocess(data[i].Body)
        preprossed2[i] = str;
        logger.write(str) // append string to your file
    }
    logger.end();

    console.log("Creating word2vec Answers")
    w2v.word2vec("data/corpusA.txt", "data/word_vectorsA.txt", { size: 100 },() => 
    {
        createEmbeddingsQ("data/Questions.json", "data/word_vectorsQ.txt", "data/qentities.txt");
    })
}


function embeddings(model, cleanedString)
 {
    // Convert a cleaned string to an embedding representation using a pretrained model
    // E.g., by averaging the word embeddings
}
function addvector(a,b){
    return a.map((e,i) => e + b[i]);
}

function createEmbeddingsQ(inputFile, modelFile, outputFile) 
{
    console.log("Creating embeddings Questions")
    try
    {
        fs.unlinkSync(outputFile)
        //file removed
    }
    catch(err)
    {
        console.error(err)
    }

    var logger = fs.createWriteStream(outputFile, 
    {
        flags: 'a' // 'a' means appending (old data will be preserved)
    })

    logger.write(Object.keys(preprossed).length + " " + 100 + "\n")
    var counter = 0
    w2v.loadModel(modelFile,  (error, model) => {
        var final_str = ""
        if(error)
        {
            console.log("there was an error")
        }
        for (let key in preprossed)
        {
            var sentence = preprossed[key].split(' ')
            var word_vec = null
            sentence.forEach(word =>
            {
                var tmp = model.getVector(word)
                if(tmp != null)
                {
                    if(word_vec == null)
                    {
                        word_vec = tmp.values
                    }
                    else
                    {
                        word_vec = addvector(word_vec, tmp.values)
                    }
                }
                
            });
            if(word_vec == null)
            {
                console.log(sentence)
                continue
            }
            if(word_vec.length != 100)
            {
                console.log("not 100")
                exit()
            }
            var scaled_word_vec = []
            for(var i = 0; i < word_vec.length; i++)
            {
                scaled_word_vec[i] = word_vec[i]/sentence.length;
            }
            
            counter += 1

            if(counter % 1000 == 0)
            {
                console.log(counter + " / " + Object.keys(preprossed).length);
            }
            var str = ""
            for(var i = 0; i < scaled_word_vec.length - 1; i++)
            {
                str = str + scaled_word_vec[i].toString() + " ";
            }
            console.log(key)
            str = str +scaled_word_vec[scaled_word_vec.length - 1] + "\n";
            final_str = final_str + (key + " " + str)
        }

        logger.write(final_str)
        logger.end();
        createEmbeddingsA("data/Answers.json", "data/word_vectorsA.txt", "data/entities.txt");
      });

    // Create the document embeddings using the pretrained model
    // Save them for lookup of the running server
}

function createEmbeddingsA(inputFile, modelFile, outputFile) 
{
    console.log("Creating embeddings Answers")
    try
    {
        fs.unlinkSync(outputFile)
        //file removed
    }
    catch(err)
    {
        console.error(err)
    }

    var logger = fs.createWriteStream(outputFile, 
    {
        flags: 'a' // 'a' means appending (old data will be preserved)
    })

    logger.write(Object.keys(preprossed2).length + " " + 100 + "\n")
    var counter = 0
    w2v.loadModel(modelFile,  (error, model) => {
        var final_str = ""
        if(error)
        {
            console.log("there was an error")
        }
        for (let key in preprossed2)
        {
            var sentence = preprossed2[key].split(' ')
            var word_vec = null
            sentence.forEach(word =>
            {
                var tmp = model.getVector(word)
                if(tmp != null)
                {
                    if(word_vec == null)
                    {
                        word_vec = tmp.values
                    }
                    else
                    {
                        word_vec = addvector(word_vec, tmp.values)
                    }
                }
                
            });
            if(word_vec == null)
            {
                console.log(sentence)
                continue
            }
            if(word_vec.length != 100)
            {
                console.log("not 100")
                exit()
            }
            var scaled_word_vec = []
            for(var i = 0; i < word_vec.length; i++)
            {
                scaled_word_vec[i] = word_vec[i]/sentence.length;
            }
            
            counter += 1

            if(counter % 1000 == 0)
            {
                console.log(counter + " / " + Object.keys(preprossed2).length);
            }
            var str = ""
            for(var i = 0; i < scaled_word_vec.length - 1; i++)
            {
                str = str + scaled_word_vec[i].toString() + " ";
            }
            str = str +scaled_word_vec[scaled_word_vec.length - 1] + "\n";
            final_str = final_str + (key + " " + str)
        }

        logger.write(final_str)
        logger.end();
        console.log("Done")
      });

    // Create the document embeddings using the pretrained model
    // Save them for lookup of the running server
}

// Suggested pipeline:
// - create a corpus
// - build w2v model (i.e., word vectors)
// - create document embeddings
//createCorpus("data/Answers.json", 'data/corpus.txt');
//w2v.word2vec("data/corpus.txt", "data/word_vectors.txt");
//createEmbeddings("data/Answers.csv", "data/word_vectors.txt", "data/entities.txt");

createCorpusQ("data/Questions.json", 'data/corpusQ.txt')

//createEmbeddings("data/Questions.json", "data/word_vectors2.txt", "data/qentities.txt");
//createEmbeddings("data/Questions.json", "data/word_vectors.txt", "data/qentities.txt");
