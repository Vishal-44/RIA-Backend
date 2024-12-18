const {
    GoogleGenerativeAI,
  } = require("@google/generative-ai");
const { response } = require("express");


async function uploadToGemini(path, mimeType,fileManager) {
    const uploadResult = await fileManager.uploadFile(path, {
        mimeType,
        displayName: path,
    });
    const file = uploadResult.file;
    console.log(`Uploaded file ${file.displayName} as: ${file.name}`);
    return file;
  }


async function waitForFilesActive(resume, fileManager) {

    console.log("Waiting for file processing...");
    let file = await fileManager.getFile(resume.name);

    // Wait if resume file state is still PROCESSING
    while (file.state === "PROCESSING") {
        process.stdout.write(".")
        await new Promise((resolve) => setTimeout(resolve, 10_000));
        file = await fileManager.getFile(name)
    }
    // if resume file state is neither PROCESSING nor ACTIVE.
    if (file.state !== "ACTIVE") {
        throw Error(`File ${file.name} failed to process`);
    }
    console.log("all files ready\n");
  }



exports.analysisByModel = async(filepath, mimeType, jobdesc)=>{

    const apiKey = process.env.GEMINI_API_KEY
    const { GoogleAIFileManager } = require("@google/generative-ai/server");

    // Create Instance of GenAI and File Manager.
    const genAI = new GoogleGenerativeAI(apiKey);
    const fileManager = new GoogleAIFileManager(apiKey);


    // import model
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
        systemInstruction: "Be point to point",
    });


    // upload to gemini file manager.
    const resume = await uploadToGemini(filepath, mimeType, fileManager)
    
    // Some files have a processing delay. Wait for them to be ready.
    await waitForFilesActive(resume,fileManager);



    const generationConfig = {
        temperature: .2,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
        responseMimeType: "text/plain",
    };

    // Starting a Chat.
    const chatSession = model.startChat({
        generationConfig,
        history: [
          {
            role: "user",
            parts: [
              {
                fileData: {
                    mimeType: resume.mimeType,
                    fileUri: resume.uri,
                },
              },
            ],
          },
        ],
    });
    // const prompts = []
    let result = await chatSession.sendMessage("Is this a Resume or not? True or false, Answer in one-word only.");
    if(result.response.text()==="false")
    {
        console.log(result.response.text())
        console.log("Please upload a resume.")
        return
    }

    const questions = [
      `Here is the job description : ${jobdesc}`,
      "- Are there typo mistakes in resume.Yes or No",
      "- Extract career summary of candidte if it is present in resume. If it is not there return No career summary.",
      "- Extract Technical skills from this candidate's resume and display it is comma seperated manner.",
      "- Does the candidate used right action verbs in his/her resume or not. Yes or No",
      "- Extract top 10 keywords from this candidate's resume and display it is comma seperated manner.",
      "- Is the candidate resume quantified? Yes or No.",
      "- Does the candidate resume have relevant work experience according to job description? Yes or No.",
      "- Does Candidate have relevant project according to job description provided above. Yes or No",
      "- Extract important keywords matched in job description and candidate resume.",
      "- State keywords that is not present in candidate resume but are required as stated in job description. Display in comma seperated manner.",
      "- Get me approxiamte percentage match between candidate resume and job description.",
      "- Suggest me few critical improvements for this resume only if needed else return No improvement needed. Return answer as an Array of simple sentences seperated by |.",
    ]

    const prompt = questions.join('\n');
    result = await chatSession.sendMessage(prompt)
    let response = result.response.text()
    console.log(response)
    response = response.split("\n")
    response = response.map((r)=>{return r.substring(2)})

    let output = {}
    output["isTypo"] = response[0]
    output["careerSummary"] = response[1]
    output["skills"] = response[2].split(", ")
    output["usedActionVerbs"] = response[3]
    output["resumeKeywords"] = response[4].split(", ")
    output["isQuantified"] = response[5]
    output["haveRelevantExperience"] = response[6]
    output["haveRelevantProject"] = response[7]
    output["matchedKeywords"] = response[8].split(", ")
    output["missingKeywords"] = response[9].split(", ")
    output["percentageMatch"] = response[10]
    output["improvements"] = response[11].split("| ")

    console.log(output)


    return output
  }