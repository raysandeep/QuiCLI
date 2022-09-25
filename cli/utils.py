import os
from PyInquirer import style_from_dict, Token, prompt
from PyInquirer import Validator, ValidationError
import re
import requests
import sys
import json
from pyfiglet import Figlet


style = style_from_dict({
    Token.QuestionMark: '#E91E63 bold',
    Token.Selected: '#673AB7 bold',
    Token.Instruction: '',
    Token.Answer: '#2196f3 bold',
    Token.Question: '',
})


def createPath(path):
    if not os.path.exists(path):
        os.makedirs(path, 777)
        return True


def getConfigDir():
    if sys.platform == "win32":
        app_config_dir = os.getenv("LOCALAPPDATA")
    else:
        app_config_dir = os.getenv("HOME")
        if os.getenv("XDG_CONFIG_HOME"):
            app_config_dir = os.getenv("XDG_CONFIG_HOME")

    configDir = os.path.join(os.path.join(
        app_config_dir, ".localconfig"), 'configstore')

    createPath(configDir)
    if os.path.exists(configDir) and not os.path.isfile(os.path.join(configDir, 'QuiCLI.json')):
        with open(os.path.join(configDir, 'QuiCLI.json'), 'w') as cf:
            json.dump({}, cf)

    return configDir


configDir = getConfigDir()

print(configDir)


def setconfig(conf):
    with open(os.path.join(configDir, 'QuiCLI.json'), 'w') as f:
        json.dump(conf, f)


def getconfig():
    with open(os.path.join(configDir, 'QuiCLI.json')) as f:
        data = json.load(f)
    return data


def initiate():
    questions = [
        {
            'type': 'input',
            'message': 'Enter your github username',
            'name': 'username'
        },
        {
            'type': 'password',
            'message': 'Enter your personal access token',
            'name': 'password'
        },
        {
            'type': 'input',
            'message': 'Enter your vm server url',
            'name': 'url'
        }
    ]
    answers = prompt(questions, style=style)

    resp = requests.post(answers['url']+'/user/V1/saveCreds', json={
        'username': answers['username'],
        'password': answers['password']
    })
    data = resp.json()
    setconfig({'username': answers['username'],
              'password': answers['password'], 'url': answers['url'], 'token': data['auth_token']})


class FileValidator(Validator):
    def validate(self, value):
        if len(value.text):
            if os.path.isfile(value.text):
                return True
            else:
                raise ValidationError(
                    message="File not found",
                    cursor_position=len(value.text))
        else:
            raise ValidationError(
                message="You can't leave this blank",
                cursor_position=len(value.text))


class URLValidator(Validator):
    def validate(self, url):
        regex = ("((http|https)://)(www.)?" +
                 "[a-zA-Z0-9@:%._\\+~#?&//=]" +
                 "{2,256}\\.[a-z]" +
                 "{2,6}\\b([-a-zA-Z0-9@:%" +
                 "._\\+~#?&//=]*)")

        p = re.compile(regex)
        if (url.text == None):
            raise ValidationError(
                message="Enter a valid url",
                cursor_position=len(url.text))
        if(re.search(p, url.text)):
            return True
        else:
            raise ValidationError(
                message="Enter a valid url",
                cursor_position=len(url.text))


class PortValidator(Validator):
    def validate(self, document):
        data = getconfig()
        # resp = requests.post(
        #     data['url'] + '/repo/V1/verifyPort', headers={
        #         'Authorization': data['token']
        #     }, json={'port': int(document.text)})
        # if resp.json()['avialable']:
        #     return True
        # raise ValidationError(
        #     message="Port is not available. Please choose some other port",
        #     cursor_position=len(document.text))
        return True


def get_services():
    data = getconfig()
    resp = requests.get(data['url'] + '/repo/V1/getServices', headers={
        'Authorization': data['token']
    })
    data = resp.json()
    return data


def print_quicli():
    f = Figlet(font='slant')
    print(f.renderText('QuiCLI'))


def deploy():
    print_quicli()
    questions = [
        {
            'type': 'input',
            'name': 'url',
            'message': 'Github URL?',
            'validate': URLValidator
        },
        {
            'type': 'input',
            'name': 'subdomain',
            'message': 'Enter your subdomain url?',
            'validate': URLValidator
        },
        {
            'type': 'input',
            'name': 'port',
            'message': 'What port did you assign?',
            'validate': PortValidator
        }, {
            'type': 'input',
            'name': 'env',
            'message': 'Please provide env location?',
            'validate': FileValidator
        },
        {
            'type': 'input',
            'name': 'services',
            'message': 'How many services does it depend on?',
            'default': '0'
        },
        {
            'type': 'input',
            'name': 'volumes',
            'message': 'How many volumes does it have?',
            'default': '0'
        }
    ]
    answers = prompt(questions, style=style)
    services = get_services()
    # print(services)
    questions2 = []
    final_services = []
    for i in services:
        final_services.append(
            {
                'name': i,
                'value': i
            })
    for i in range(1, int(answers.get('services', 1))):
        questions2.append(prompt([{
            'type': 'expand',
            'name': 'services'+str(i),
            'message': 'Choose the service {}:'.format(str(i-1)),
            'choices': final_services
        }]))

    for i in range(1, int(answers.get('volumes', 1))):
        questions2.append(prompt([{
            'type': 'input',
            'name': 'volumes'+str(i),
            'message': 'Enter the volume {}:'.format(str(i-1)),
        }]))
    # print(questions2)

    answers2 = prompt(questions=questions2, style=style)
    f = open(answers['env'], "r")
    answers['env'] = f.read()
    services = []
    for i in range(1, len(answers.get('services', 1))):
        services.append(answers2['services'+str(i)])
    answers['services'] = services
    volumes = []
    for i in range(1, len(answers.get('volumes', 1))):
        services.append(answers2['volumes'+str(i)])
    answers['volumes'] = volumes
    answers['network'] = ['web', 'internal']
    # print(answers)
    data = getconfig()
    resp = requests.post(data['url']+'/repo/V1/cloneRepo', headers={
        'Authorization': data['token']
    }, json=answers)
    # print(resp.text)
    responese = resp.json()
    if responese["repsonse"] == "done":
        print("Deployent Initiated!")
    resp = requests.post(data['url']+'/repo/V1/deploy',)
    deploy_status = resp.json()
    if resp.ok:
        print("\nDeployment Successful!")


def checkcred():
    # setconfig({'username': 'raysandeep'})
    print(getconfig())
