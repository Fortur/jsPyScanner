const imageContainer = document.getElementById('image-container');
const imageInput = document.getElementById('image-file');
const imageOutput = document.getElementById('image-element');
const body = document.body;

// Храненеие данных документа
let documentData = {};
const idCacheToClear = [];

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

function createIdToClear(createdId) {
    const id = createdId || 'id' + Math.random().toString(16).slice(2);
    idCacheToClear.push(id);
    return id;
}

// ----

// Отправка запросов
async function sendRequest(route, data) {
    return fetch(`http://localhost:3000/${route}`, {
        method: 'POST',
        headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
        body: JSON.stringify(data),
    }).then(function (response) {
        return response.json();
    });
}

// Отправка запроса и обработка результатов с их отрисовкой
async function SendDocPhotoAndDrawResult() {
    delete imageContainer.classList.add('displayNone');

    const photo = imageInput.files[0];
    const imgBase64 = await encodeFileToBase64Async(photo);

    try {
        console.log('Send file...');
        await sendDocPhotoAndCacheResult(imgBase64);

        console.log('draw result');
        drawImage(imgBase64);

        // Отрисовка всех элементов, когда уже отрисована картинка и известны её размеры
        setTimeout(() => {
            showProcessedDocResult([imageOutput.clientHeight, imageOutput.clientWidth], imageOutput.clientHeight / imageOutput.naturalHeight);
        }, 0);
    } catch (e) {
        console.log('Huston we have problem...:', e);
    }
}

// Отрисовка картинки
function drawImage(imgBase64) {
    console.log('draw image');
    imageOutput.src = imgBase64;
    delete imageContainer.classList.remove('displayNone');
}

// Получение данных по картинке и сохранение их в хранилище
async function sendDocPhotoAndCacheResult(imgBase64) {
    const documentProcessedData = await sendRequest('startDocumentProcessed', {image: imgBase64});

    if (!documentProcessedData) {
        alert('Ошибка запроса');
        throw new Error('Req error');
    }

    documentData = {...JSON.parse(documentProcessedData), encodedData: imgBase64};
}

// Отрисовка картинки и данных из документа
function showProcessedDocResult(imgSize, imgResizeIdx) {
    const {
        document_type: docType, document_geometry: geometry, fields,
    } = documentData;

    drawDocCanvas(geometry?.templates, imgSize, imgResizeIdx);

    drawDocName(docType);

    drawTable(fields);

    drawButton();
}

// Отрисовка кнопки
function drawButton() {
    console.log('draw button');
    const buttonTag = document.createElement('button');
    buttonTag.appendChild(document.createTextNode('Отправить финальный результат'));
    buttonTag.setAttribute('onclick', 'sendFinalData()');
    buttonTag.setAttribute('id', createIdToClear('sendFinalDataButton'));
    body.appendChild(buttonTag);
}

// Отправка финальных данных с картинкой
async function sendFinalData() {
    console.log('send file with final data...');
    const res = await sendRequest('registerResult', {
        image: documentData.encodedData,
        document_data_fields: documentData.fields,
    });

    const newCanvas = document.createElement('canvas');
    newCanvas.setAttribute('id', 'canvas');
    newCanvas.setAttribute('class', 'canvas');

    const canvas = document.getElementById('canvas');

    const parent = canvas.parentNode;
    parent.removeChild(canvas);
    parent.prepend(newCanvas);

    while (idCacheToClear.length) {
        document.getElementById(idCacheToClear.pop()).remove();
    }

    delete imageContainer.classList.add('displayNone');
    if (!res) {
        alert('Ошибка запроса');
    } else {
        alert('Данные успешно сохранены');
    }
}

function drawDocName(docType) {
    console.log('draw doc name');
    const docTypeTag = document.createElement('div');
    docTypeTag.setAttribute('id', createIdToClear());
    docTypeTag.appendChild(document.createTextNode(`Название документа: ${docType}`));
    body.appendChild(docTypeTag);
}

// Отрисовка таблицы с полями документа
function drawTable(fields) {
    console.log('draw table');
    const defaultBorder = '1px solid black';

    const tbl = document.createElement('table');
    tbl.setAttribute('id', createIdToClear());
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
    console.log('draw canvas');
    if (!templates || templates.length === 0) {
        return;
    }

    const canvas = document.getElementById('canvas');
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
