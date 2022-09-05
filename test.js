const panelContent = [
    {
        type: "text",
        text: "This is Header",
        header: true,
    },
    {
        type: "text",
        text: "Normal Text",
    },
    {
        type: "text",
        text: "Normal Text ArambolBeach_ZH-CN2149857876_1920x1200OhNotSoNormalJustTooLongToLookAtAndBreakAhhh",
    },
    {
        type: "img",
        src: "https://cn.bing.com/th?id=OHR.ArambolBeach_ZH-CN2149857876_1920x1200.jpg&rf=LaDigue_1920x1200.jpg",
    },
    {
        type: "img",
        src: "https://cn.bing.com/th?id=OHR.ArambolBeach_ZH-CN2149857876_1920x1200.jpg&rf=LaDigue_1920x1200.jpg",
        iframe: true,
    },
    {
        type: "input",
        id: "i0",
    },
    {
        type: "input",
        id: "i1",
        subtype: "password",
        hint: "password",
        value: "123465",
    },
    {
        type: "input",
        id: "i2",
        subtype: "textarea",
        hint: "content",
        value: "Default Content",
    },
    {
        type: "input",
        id: "i3",
        subtype: "text",
        hint: "123",
        value: "hello",
    },
    {
        type: "buttons",
        ids: [ "b0", "b1", "b2", "b3" ],
        labels: [ "Ok", "No", "Confirm", "Cancel" ],
        disabled: [ true, false, false, true ],
        close: false,
    }
];
let loop = true;
while (loop) {
    const resp = await fetch("http://127.0.0.1:18968/waitResponse?name=test", {
        method: "POST",
        body: JSON.stringify(panelContent),
    })
    const respObj = (await resp.json());
    console.log(JSON.stringify(respObj.data, undefined, 2));
    if (respObj.code === 200) {
        loop = false;
        break;
    }
}
await fetch("http://127.0.0.1:18968/waitResponse?name=test", {
    method: "POST",
    body: JSON.stringify(panelContent),
})
