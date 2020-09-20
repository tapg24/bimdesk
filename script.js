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

var content_type_aa = {
    'log': 'application/octet-stream',
    'png': 'image/png'
}

var image_count = 0;

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

$(document).ready(function () {
    init();
});

function init() {
    // fill env_select
    var env_select = document.getElementById('env_select');
    env_select.onchange = on_env_select_changed;
    for (index in env_array) {
        var opt = env_array[index];
        env_select.options[env_select.options.length] = new Option(opt.text, opt.value);
    }

    // fill section_select
    var section_select = document.getElementById('section_select');
    section_select.onchange = on_section_select_changed;
    var section_array = section_aa[env_select.options[env_select.selectedIndex].value]
    for (index in section_array) {
        var opt = section_array[index];
        section_select.options[section_select.options.length] = new Option(opt.text, opt.value);
    }

};

function on_env_select_changed(ev) {
    var section_select = document.getElementById('section_select');
    clear_select(section_select);
    var section_array = section_aa[this.options[this.selectedIndex].value]
    for (index in section_array) {
        var opt = section_array[index];
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
    var file = event.target.files[0];
    attachment_array.push(
        {
            name: file.name,
            path: event.target.value
        }
    );
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

$(function () {

    $("#open_outlook").click(function () {
        try {
            var env = document.getElementById("env_select");
            var env_text = env.options[env.selectedIndex].text

            var section = document.getElementById("section_select");
            var section_text = '';
            if (section.selectedIndex !== -1) {
                var section_text = section.options[section.selectedIndex].text
            }

            var objO = new ActiveXObject('Outlook.Application');
            var objNS = objO.GetNameSpace('MAPI');
            var mItm = objO.CreateItem(0);
            mItm.To = document.getElementById("recipient").value;
            mItm.Subject = document.getElementById("subject").value;
            var structure = JSON.stringify({
                env: env_text,
                section: section_text,
                description: description
            });
            mItm.Body = '[STRUCTURE]' + structure + '[/STRUCTURE]'

            for (var i = 0; i < attachment_array.length; i++) {
                mItm.Attachments.Add(attachment_array[i].path);
            }

            mItm.Display();
        }
        catch (e) {
            alert(e);
            console.exception(e);
        }
    });

});