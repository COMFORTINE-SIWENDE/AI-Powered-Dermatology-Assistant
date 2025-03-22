# AI-Powered-Dermatology-Assistant
This is an Agentic AI application that uses a CNN model for skin disease classification and provides healthcare recommendations using LangChain,Azure AI search and Azure OpenAI (GPT-4 Turbo) model. Built with Django REST Framework, ReactJs Library, and MariaDB for seamless interaction and data management."
## Steps on How to Clone And Run the Project
#### 1. Clonning the project
Run `git clone https://github.com/COMFORTINE-SIWENDE/AI-Powered-Dermatology-Assistant.git`
#### 2. Create a new virtual environment and activate it. In This case root dir(dirmatology assistant)
- In linux distribution
```bash
python3 -m venv venv
. ./venv/bin/activate
pip install -r requirements.txt
```
- In Window os
```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```
- Run the Django api endpoints
```bash
cd endpoints
python manage.py runserver
```
- Run React App
```bash
cd client
npm run dev
```
# Project Workflow
### Project Tools,Frameworks and Libraries
- Azure Machine Learning Compute
- Azure AI Search
- Azure OpenAI(GPT-4 model)
- Langchain
- Tensorflow
- Django REST 
- ReactJs
- MariaDB
## 1.Training Convolution Neural Network with Azure ML Compute
![Azure ML Studio:](ai-hack-img/Azure-machine-learning-studio.png)
#### Connecting Azure ML Studio with Vs Code
![Connecting](ai-hack-img/azure-vs-code-model-training.png)
#### Saving the generalized CNN Model
![.](ai-hack-img/how-to-get-the-model.png)
#### Skin Disease Classification Model Summary
![Summary:](ai-hack-img/model-summary.png)

## 2.Setting Development Environment
## 3.Autonomous Chatbot AI Agent
#### Integrating AzureOpenAI,Azure AI Search to Iteract with the Skin Disease Classification Model and the System.
### 3.1 Prompt Chaining
### 3.2 Retrieval Augmented Generation
### 3.3 Routing
### Parallelization

