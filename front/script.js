const imageContainer = document.getElementById('image-container');
const imageInput = document.getElementById('image-file');
const imageOutput = document.getElementById('image-element');
const canvas = document.getElementById('canvas');

async function SendDocPhoto() {
    delete imageContainer.classList.add('displayNone')

    const ctrl = new AbortController()    // timeout
    setTimeout(() => ctrl.abort(), 5000);

    const photo = imageInput.files[0];
    const encodedData = await encodeFileToBase64Async(photo)
    const body = JSON.stringify({
        image: encodedData,
    })

    try {
        const result = await fetch('http://localhost:3000', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body,
            signal: ctrl.signal,
        }).then(function (response) {
            return response.json();
        })

        const fixedJsonStr = result.replaceAll('\\', '\\\\')

        imageOutput.src = encodedData;
        delete imageContainer.classList.remove('displayNone')
        setTimeout(() => {
            canvas.width
            showSendDocResult(JSON.parse(fixedJsonStr), [imageOutput.clientHeight, imageOutput.clientWidth], imageOutput.clientHeight / imageOutput.naturalHeight)
        }, 0)
    } catch (e) {
        console.log('Huston we have problem...:', e);
    }
}

function showSendDocResult(documentData, imgSize, imgResizeIdx) {
    const {
        document_type,
        document_geometry: geometry,
        fields,
    } = documentData;

    // console.log(documentData)

    drawDocCanvas(geometry?.templates, imgSize, imgResizeIdx)

}

function drawDocCanvas(templates, imgSize, imgResizeIdx) {
    const ctx = canvas.getContext('2d');
    ctx.canvas.height = imgSize[0]
    ctx.canvas.width = imgSize[1]

    for (const template of Object.values(templates)) {
        const {template_quad: templateQuad} = template
        const startPoint = templateQuad.shift()
        console.log(startPoint[0] * imgResizeIdx, startPoint[1] * imgResizeIdx);
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
                resolve(srcData)

                // var newImage = document.createElement('img');
                // newImage.src = srcData;
                //
                // document.getElementById("imgTest").innerHTML = newImage.outerHTML;
                // alert("Converted Base64 version is " + document.getElementById("imgTest").innerHTML);
                // console.log("Converted Base64 version is " + document.getElementById("imgTest").innerHTML);
            }
            fileReader.readAsDataURL(encodedData);
        } catch (err) {
            reject(err)
        }
    })


}
