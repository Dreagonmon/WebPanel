const panelContent = [
    {
        "type": "text",
        "text": "Please fill the field."
    },
    {
        "type": "input",
        "id": "user_name"
    },
    {
        "type": "buttons",
        "ids": [ "confirm_button" ],
        "labels": [ "Confirm" ]
    }
];

const BASE_ADDRESS = "http://127.0.0.1:18968";
const webPanel = async (panelName, content) => {
    while (true) {
        const url = new URL(`${BASE_ADDRESS}/waitResponse`);
        url.searchParams.set("name", panelName);
        const resp = await fetch(url, {
            method: "POST",
            body: JSON.stringify(content),
        });
        const respObj = (await resp.json());
        if (respObj.code === 200) {
            return respObj.data;
        }
        if (respObj.code !== 504) {
            throw Error(respObj.data);
        }
    }
};

const data = await webPanel("test", panelContent);

console.log(data);
