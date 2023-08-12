const imageContainer = document.getElementById('image-container');
const imageInput = document.getElementById('image-file');
const imageOutput = document.getElementById('image-element');
const canvas = document.getElementById('canvas');
const body = document.body;

// Храненеие данных документа
let documentData = {};

// Вспомогательные функции ----
function getDataIdForField(field) {
    return `id||data||${field}`;
}

function getInputIdForField(field) {
    return `id||Input||${field}`;
}

function getDataIdByInputId(inputId) {
    return `id||data||${inputId.split('||').pop()}`;
}

// ----

// Отправка запроса и обработка результатов с их отрисовкой
async function SendDocPhoto() {
    delete imageContainer.classList.add('displayNone');

    const photo = imageInput.files[0];
    const encodedData = await encodeFileToBase64Async(photo);

    try {
        const result = await fetch('http://localhost:3000/startDocumentProcessed', {
            method: 'POST',
            headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
            body: JSON.stringify({image: encodedData}),
        }).then(function (response) {
            return response.json();
        });

        const fixedJsonStr = result.replaceAll('\\', '\\\\');

        documentData = {...JSON.parse(fixedJsonStr), encodedData};

        imageOutput.src = encodedData;
        delete imageContainer.classList.remove('displayNone');
        setTimeout(() => {
            canvas.width;
            showSendDocResult([imageOutput.clientHeight, imageOutput.clientWidth], imageOutput.clientHeight / imageOutput.naturalHeight);
        }, 0);
    } catch (e) {
        console.log('Huston we have problem...:', e);
    }
}

// Отрисовка картинки и данных из документа
function showSendDocResult(imgSize, imgResizeIdx) {
    const {
        document_type: docType, document_geometry: geometry, fields,
    } = documentData;

    drawDocCanvas(geometry?.templates, imgSize, imgResizeIdx);

    drawTable(docType, fields);

    drawButton();
}

function drawButton() {
    const buttonTag = document.createElement('button');
    buttonTag.appendChild(document.createTextNode("Отправить финальный результат"));
    buttonTag.setAttribute('onclick', 'sendFinalData()');
    buttonTag.setAttribute('id', 'sendFinalDataButton');
    body.appendChild(buttonTag);
}

async function sendFinalData() {
    const result = await fetch('http://localhost:3000/registerResult', {
        method: 'POST',
        headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
        body: JSON.stringify({image: documentData.encodedData, document_data_fields: documentData.fields}),
    }).then(function (response) {
        // todo очистить всю информацию, вывести сообщение успеха
    });
}

// Отрисовка таблицы с полями документа
function drawTable(docType, fields) {
    const defaultBorder = '1px solid black';
    const docTypeTag = document.createElement('p');
    body.appendChild(docTypeTag.appendChild(document.createTextNode(`Название документа: ${docType}`)));

    const tbl = document.createElement('table');
    tbl.style.width = '100px';

    fields = {
        'Поле': {
            value: 'Значение', is_rejected: false, confidence: 'Уверенность',
        }, ...fields,
    };

    let idx = 0;
    for (const field in fields) {
        const tr = tbl.insertRow();
        const title = tr.insertCell();
        title.appendChild(document.createTextNode(field));

        const data = tr.insertCell();
        data.appendChild(document.createTextNode(fields[field].value));
        if (idx !== 0) {
            const id = getDataIdForField(field);
            data.setAttribute('id', id);
        }
        if (fields[field].is_rejected) {
            data.style['border-bottom'] = '1px solid red';
        }

        const confidence = tr.insertCell();
        confidence.appendChild(document.createTextNode(fields[field].confidence));


        const edit = tr.insertCell();

        if (idx === 0) {
            edit.appendChild(document.createTextNode('Редактирование'));
        } else {
            const editInput = document.createElement('input');
            edit.appendChild(editInput);
            const id = getInputIdForField(field);
            editInput.setAttribute('id', id);
            editInput.setAttribute('onkeyup', `editValue('${id}','${field}');`);
        }


        if (idx === 0) {
            title.style['border-bottom'] = defaultBorder;
            data.style['border-bottom'] = defaultBorder;
            confidence.style['border-bottom'] = defaultBorder;
        }
        title.style['border-left'] = defaultBorder;
        data.style['border-left'] = defaultBorder;
        confidence.style['border-left'] = defaultBorder;
        title.style['border-right'] = defaultBorder;
        data.style['border-right'] = defaultBorder;
        confidence.style['border-right'] = defaultBorder;
        idx++;
    }

    body.appendChild(tbl);
}

// Функция для изменения значений пользователем вручную
function editValue(inputId, attr) {
    const {value} = document.getElementById(inputId);
    const dataId = getDataIdByInputId(inputId);

    const dataField = document.getElementById(dataId);
    if (value) {
        dataField.classList.add('textDecoration');
        documentData.fields[attr].verified_value = value;
    } else {
        dataField.classList.remove('textDecoration');
        delete documentData.fields[attr].verified_value;
    }
}

// Отрисовка границ найденных документов
function drawDocCanvas(templates, imgSize, imgResizeIdx) {
    if (!templates || templates.length === 0) {
        return;
    }

    const ctx = canvas.getContext('2d');
    ctx.canvas.height = imgSize[0];
    ctx.canvas.width = imgSize[1];

    for (const template of Object.values(templates)) {
        const {template_quad: templateQuad} = template;
        const startPoint = templateQuad.shift();
        ctx.strokeStyle = 'red';
        ctx.beginPath();
        ctx.moveTo(startPoint[0] * imgResizeIdx, startPoint[1] * imgResizeIdx);

        for (const templateQuadPoint of templateQuad) {
            ctx.lineTo(templateQuadPoint[0] * imgResizeIdx, templateQuadPoint[1] * imgResizeIdx);
        }
        ctx.closePath();
        ctx.stroke();
    }
}

// Кодирование картинки в base64
async function encodeFileToBase64Async(encodedData) {
    return new Promise((resolve, reject) => {
        try {
            const fileReader = new FileReader();
            fileReader.onload = function (fileLoadedEvent) {
                const srcData = fileLoadedEvent.target.result;
                resolve(srcData);
            };
            fileReader.readAsDataURL(encodedData);
        } catch (err) {
            reject(err);
        }
    });
}
