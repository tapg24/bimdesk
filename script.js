var env_array = [
    { value: 'civil', text: 'Civil' },
    { value: 'revit', text: 'Revit' },
    { value: 'engineering', text: 'Engineering' }
];

var section_aa = {
    'civil': [
    ],
    'revit': [
        { value: '1', text: 'АР' },
        { value: '2', text: 'КР' },
        { value: '3', text: 'ОВ/ВК' },
        { value: '4', text: 'ЭОМ' },
        { value: '5', text: 'ТХ' },
        { value: '6', text: 'Координация' },
        { value: '7', text: 'Семейство' }
    ],
    'engineering': [
        { value: '1', text: 'Inventor' },
        { value: '2', text: 'Ansys' }
    ]
};


var attachment_array = [
]

var attachment_image_array = [
]

var content_type_aa = {
    'log': 'application/octet-stream',
    'png': 'image/png'
}

function* generateSequence(start, end) {
    for (let i = start; i <= end; i++) yield i;
}

var seqGen = generateSequence(1, 9);

window.addEventListener("DOMContentLoaded", function () {
    // init elements
    init();
});

function init() {
    // fill env_select
    var env_select = document.getElementById('env_select');
    env_select.onchange = on_env_select_changed;
    for (index in env_array) {
        const opt = env_array[index];
        env_select.options[env_select.options.length] = new Option(opt.text, opt.value);
    }

    // fill section_select
    var section_select = document.getElementById('section_select');
    section_select.onchange = on_section_select_changed;
    const section_array = section_aa[env_select.options[env_select.selectedIndex].value]
    for (index in section_array) {
        const opt = section_array[index];
        section_select.options[section_select.options.length] = new Option(opt.text, opt.value);
    }

    // configure input file element
    var file_list = document.getElementById('file_list').getElementsByTagName('input');

    // configure paste image
    document.getElementById("paste_image").addEventListener("paste", function (pasteEvent) {
        retrieveImageFromClipboard(pasteEvent.clipboardData, function (img) {
            if (img) {
                var canvas = append_canvas();
                var ctx = canvas.getContext('2d');
                // fit
                // var scale = Math.min(canvas.width / img.width, canvas.height / img.height);
                // fill
                var scale = Math.max(canvas.width / img.width, canvas.height / img.height);
                var x = (canvas.width / 2) - (img.width / 2) * scale;
                var y = (canvas.height / 2) - (img.height / 2) * scale;
                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
                var content_type = canvas.toDataURL("image/png").split(',')[0].split(':')[1].split(';')[0]
                var base64 = canvas.toDataURL("image/png").split(',')[1]
                var name = 'Image' + seqGen.next().value;
                attachment_image_array.push(
                    { name: name, base64: base64, content_type: content_type }
                )
                canvas.id = name;
            }
        })
    }, false);
};

function on_env_select_changed(ev) {
    var section_select = document.getElementById('section_select');
    clear_select(section_select);
    const section_array = section_aa[this.options[this.selectedIndex].value]
    for (index in section_array) {
        const opt = section_array[index];
        section_select.options[section_select.options.length] = new Option(opt.text, opt.value);
    }
}

function on_section_select_changed(ev) {
}



function clear_select(selectElement) {
    var i, L = selectElement.options.length - 1;
    for (i = L; i >= 0; i--) {
        selectElement.remove(i);
    }
}

function append_fileinput() {
    var root = document.getElementById('file_list');

    var wrapper = document.createElement('div');
    wrapper.className = 'input_wrapper';

    var close = document.createElement('button');
    close.textContent = '-';
    close.onclick = remove_fileinput;

    var input = document.createElement('input');
    input.type = "file";
    input.onchange = on_fileinput_changed;

    wrapper.appendChild(close);
    wrapper.appendChild(input);
    root.appendChild(wrapper);
}

function on_fileinput_changed(event) {
    var file = event.target.files[0]

    const reader = new FileReader();
    reader.addEventListener('load', (event) => {
        var content_type = event.target.result.split(',')[0].split(':')[1].split(';')[0]
        var base64 = event.target.result.split(',')[1]
        attachment_array.push(
            { name: file.name, base64: base64, content_type: content_type }
        )
    });
    reader.readAsDataURL(file);
}


function remove_fileinput(event) {
    var file = event.target.parentNode.getElementsByTagName('input')[0].files[0];
    var i = attachment_array.length
    while (i--) {
        if (attachment_array[i].name === file.name) {
            attachment_array.splice(i, 1);
        }
    }
    event.target.parentNode.parentNode.removeChild(event.target.parentNode)
    return false;
}

function append_canvas() {
    var root = document.getElementById('canvas_list');

    var canvas_wrapper = document.createElement('div');
    canvas_wrapper.className = 'canvas_wrapper';

    var canvas = document.createElement('canvas');
    canvas.className = 'thumbnail'

    var closeCanvas = document.createElement('span');
    closeCanvas.textContent = 'x';
    closeCanvas.className = 'closeCanvas'
    closeCanvas.onclick = removeCanvas;

    canvas_wrapper.appendChild(canvas);
    canvas_wrapper.appendChild(closeCanvas);
    root.appendChild(canvas_wrapper);
    return canvas;
}

function removeCanvas(event) {
    var name = event.target.parentNode.getElementsByTagName('canvas')[0].id;
    var i = attachment_image_array.length
    while (i--) {
        if (attachment_image_array[i].name === name) {
            attachment_image_array.splice(i, 1);
        }
    }
    event.target.parentNode.parentNode.removeChild(event.target.parentNode)
    return false;
}

function retrieveImageFromClipboard(clipboardData, callback) {
    if (clipboardData == false) {
        if (typeof (callback) == "function") {
            callback();
        }
    };

    var items = clipboardData.items;

    if (items == undefined) {
        if (typeof (callback) == "function") {
            callback();
        }
    };

    for (var i = 0; i < items.length; i++) {
        // Skip content if not image
        if (items[i].type.indexOf("image") == -1) continue;
        // Retrieve image on clipboard as blob
        var blob = items[i].getAsFile();

        // Create an image
        var img = new Image();

        // Once the image loads, render the img on the canvas
        img.onload = () => {
            callback(img);
        };

        // Crossbrowser support for URL
        var URLObj = window.URL || window.webkitURL;

        // Creates a DOMString containing a URL representing the object given in the parameter
        // namely the original Blob
        img.src = URLObj.createObjectURL(blob);
    }
}

// ref: https://stackoverflow.com/questions/30106476/using-javascripts-atob-to-decode-base64-doesnt-properly-decode-utf-8-strings
function b64EncodeUnicode(str) {
    // first we use encodeURIComponent to get percent-encoded UTF-8,
    // then we convert the percent encodings into raw bytes which
    // can be fed into btoa.
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
        }));
}

function b64DecodeUnicode(str) {
    // Going backwards: from bytestream, to percent-encoding, to original string.
    return decodeURIComponent(atob(str).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

function create_eml() {
    var recipient = document.getElementById("recipient").value;
    var subject = document.getElementById("subject").value;

    var env = document.getElementById("env_select");
    var env_text = env.options[env.selectedIndex].text

    var section = document.getElementById("section_select");
    var section_text = '';
    if (section.selectedIndex !== -1) {
        var section_text = section.options[section.selectedIndex].text
    }

    var description = document.getElementById("description").value;

    var output = 'To:' + recipient + '\n';
    output += 'Subject: ' + subject + '\n';
    output += 'X-Unsent: 1' + '\n';
    output += 'Content-Type: multipart/mixed; boundary="boundary"\n'
    output += '\n';
    output += '--boundary\n';
    output += 'Content-Type: application/json; charset=UTF-8; name=="task.dat"\n';
    output += 'Content-Transfer-Encoding: base64\n'
    output += 'Content-Disposition: attachment\n';
    output += '\n';
    output += b64EncodeUnicode(JSON.stringify({
        env: env_text,
        section: section_text,
        description: description

    }))
    output += '\n\n';

    for (var attachment of attachment_array) {
        output += '--boundary\n';
        output += 'Content-Type: ' + attachment.content_type + '; name="' + attachment.name + '"\n';
        output += 'Content-Transfer-Encoding: base64\n';
        output += 'Content-Disposition: attachment\n';
        output += '\n';
        output += attachment.base64 + '\n';
        output += '\n';
    }

    for (var attachment of attachment_image_array) {
        output += '--boundary\n';
        output += 'Content-Type: ' + attachment.content_type + '; name="' + attachment.name + '"\n';
        output += 'Content-Transfer-Encoding: base64\n';
        output += 'Content-Disposition: attachment\n';
        output += 'Content-ID: <' + attachment.name.split('.')[0] + '>\n'
        output += 'Content-Disposition: inline; filename="' + attachment.name + '"\n';
        output += '\n';
        output += attachment.base64 + '\n';
        output += '\n';
    }

    output += '--boundary--\n';
    output += '\n';

    return output;
}

makeTextFile = function (text) {
    var data = new Blob([text], { type: 'text/plain' });
    var textFile = window.URL.createObjectURL(data);
    return textFile;
};

function open_eml() {
    var a_link = document.getElementById("download_eml");
    text = create_eml();
    file_link = makeTextFile(text);
    a_link.href = file_link;
    a_link.download = 'message.eml';
    a_link.click();
}