const imageContainer = document.getElementById('image-container');
const imageInput = document.getElementById('image-file');
const imageOutput = document.getElementById('image-element');
const canvas = document.getElementById('canvas');
const body = document.body;

function getDataIdForField(field) {
    return `id||data||${field}`;
}

function getInputIdForField(field) {
    return `id||Input||${field}`;
}

function getDataIdByInputId(inputId) {
    return `id||data||${inputId.split('||').pop()}`;
}

async function SendDocPhoto() {
    delete imageContainer.classList.add('displayNone');

    const ctrl = new AbortController();    // timeout
    setTimeout(() => ctrl.abort(), 5000);

    const photo = imageInput.files[0];
    const encodedData = await encodeFileToBase64Async(photo);
    const body = JSON.stringify({
        image: encodedData,
    });

    try {
        const result = await fetch('http://localhost:3000', {
            method: 'POST', headers: {
                'Accept': 'application/json', 'Content-Type': 'application/json',
            }, body, signal: ctrl.signal,
        }).then(function (response) {
            return response.json();
        });

        const fixedJsonStr = result.replaceAll('\\', '\\\\');

        imageOutput.src = encodedData;
        delete imageContainer.classList.remove('displayNone');
        setTimeout(() => {
            canvas.width;
            showSendDocResult(JSON.parse(fixedJsonStr), [imageOutput.clientHeight, imageOutput.clientWidth], imageOutput.clientHeight / imageOutput.naturalHeight);
        }, 0);
    } catch (e) {
        console.log('Huston we have problem...:', e);
    }
}

function showSendDocResult(documentData, imgSize, imgResizeIdx) {
    const {
        document_type: docType, document_geometry: geometry, fields,
    } = documentData;

    drawDocCanvas(geometry?.templates, imgSize, imgResizeIdx);

    drawTable(docType, fields);

}

function drawTable(docType, fields) {
    const defaultBorder = '1px solid black';
    const docTypeTag = document.createElement('p');
    body.appendChild(docTypeTag.appendChild(document.createTextNode(`Название документа: ${docType}`)));

    const tbl = document.createElement('table');
    tbl.style.width = '100px';
    console.log(fields);

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

function editValue(inputId, attr) {
    const {value} = document.getElementById(inputId);
    const dataId = getDataIdByInputId(inputId);


    const dataField = document.getElementById(dataId);
    if (value) {
        dataField.classList.add('textDecoration');
    } else {
        dataField.classList.remove('textDecoration');
    }

    console.log(dataId, value, attr);
}

function drawDocCanvas(templates, imgSize, imgResizeIdx) {
    const ctx = canvas.getContext('2d');
    ctx.canvas.height = imgSize[0];
    ctx.canvas.width = imgSize[1];

    for (const template of Object.values(templates)) {
        const {template_quad: templateQuad} = template;
        const startPoint = templateQuad.shift();
        ctx.strokeStyle = 'red';
        ctx.beginPath(); // Начинает новый путь
        ctx.moveTo(startPoint[0] * imgResizeIdx, startPoint[1] * imgResizeIdx); // Передвигает перо в точку (30, 50)

        for (const templateQuadPoint of templateQuad) {
            ctx.lineTo(templateQuadPoint[0] * imgResizeIdx, templateQuadPoint[1] * imgResizeIdx); // Рисует линию до точки (150, 100)
        }
        ctx.closePath();
        ctx.stroke(); // Отображает путь
    }
}

async function encodeFileToBase64Async(encodedData) {
    return new Promise((resolve, reject) => {
        try {
            const fileReader = new FileReader();
            fileReader.onload = function (fileLoadedEvent) {
                const srcData = fileLoadedEvent.target.result; // <--- data: base64
                resolve(srcData);

                // var newImage = document.createElement('img');
                // newImage.src = srcData;
                //
                // document.getElementById("imgTest").innerHTML = newImage.outerHTML;
                // alert("Converted Base64 version is " + document.getElementById("imgTest").innerHTML);
                // console.log("Converted Base64 version is " + document.getElementById("imgTest").innerHTML);
            };
            fileReader.readAsDataURL(encodedData);
        } catch (err) {
            reject(err);
        }
    });


}
