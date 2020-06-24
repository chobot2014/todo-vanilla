const http = require('http');
const fs = require('fs');
const url = require('url');

async function App(request, response) {

    /**
     * {
     *  id: number,
     *  title: string, (needed for creation)
     *  body: string (needed for creation)
     *  doneStatus: boolean
     * }
     * 
     *  Operations, preceded by /api
     * 
     *  ListTodos GET no params
     *  AddTodo: POST {title: string, body: string}
     *  DeleteTodo: POST id: number
     *  UpdateTodo: POST: {id: number, doneStatus: boolean}
     * 
     * 
     *  any other request should get the html page
     * 
     */


    async function getIndexFile() {
        return new Promise(res => fs.readFile("index.html", (err, dat) => res(dat)));
    }

    async function getData() {
        return new Promise(res => fs.readFile("data.json", (err, dat) => res(dat)));
    }

    async function writeData(data) {
        return new Promise(res => fs.writeFile("data.json", data, () => res()));
    }
    const OperationHandlers = {
        ListTodos: async function () {
            return await getData();
        },
        AddTodo: async function (todo) {
            let data = await getData();
            let parsedData = JSON.parse(data);
            parsedData.sort((a, b) => a.id > b.id);
            let newId = 0;
            if (parsedData.length && parsedData.length > 0) {
                newId = parsedData[parsedData.length - 1].id + 10;
            }
            parsedData.push({
                id: newId,
                doneStatus: false,
                title: todo.title,
                body: todo.body
            });
            await writeData(JSON.stringify(parsedData));
            return true;
        },
        DeleteTodo: async function (id) {
            let data = await getData();
            let parsedData = JSON.parse(data);
            newData = parsedData.filter(x => x.id !== id);
            await writeData(JSON.stringify(newData));
            return true;
        },
        UpdateTodo: async function (todo) {
            let data = await getData();
            let parsedData = JSON.parse(data);
            parsedData
                .find(x => x.id === todo.id)
                .doneStatus = todo.doneStatus;
            await writeData(JSON.stringify(parsedData));
            return true;
        }
    };

    let pathName = url.parse(request.url, true).pathname;
    if (pathName.startsWith("/api")) {
        let requestOperation = (pathName.split('/api')[1]).split('/')[1];
        let requestQuery = url.parse(request.url, true).query;
        let requestPayload = {
            ...request.body,
            ...requestQuery
        };
        if (typeof OperationHandlers[requestOperation] !== 'undefined') {
            response.write(await OperationHandlers[requestOperation](requestPayload));
        }
    } else {
        response.write(await getIndexFile());
    }

    response.end();
};

const server = http.createServer(App);
server.listen(4000);