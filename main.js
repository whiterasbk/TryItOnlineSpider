import "axios"
import pako from "pako/dist/pako.esm.mjs"
import axios from "axios"
import {languages} from "./languages.js";
let runURL = "/cgi-bin/static/fb67788fd3d1ebf92e66b295525335af-run";
let tio_url = "https://tio.run"

export async function runCode(codeConfig) {

    if (codeConfig.run_url !== undefined && codeConfig.run_url !== "") runURL = codeConfig.run_url

    let response = await axios.post(
        tio_url + runURL + "/" + getRandomBits(128),
        code_encode(codeConfig),
        {
            responseType: "arraybuffer"
        }
    )
    
    let res_text = ""
    for (let e of pako.inflateRaw(response.data.slice(10))) {
        res_text += String.fromCharCode(e)
    }

    let results = ""
    res_text.substr(16).split(res_text.substr(0, 16)).forEach(str => {
        if (str === '' || str === '\n') return
        results += str
    });

    return byteStringToText(results)
}

function code_encode(params) {

    if (params === undefined) throw "empty"
    if (params.code === undefined || params.lang === undefined) throw "empty code or lang"

    let code = textToByteString(params.code)  
    let lang = params.lang
    let has_lang = false
    let input = "" 
    let cmd_opt = []
    let cmd_opt_str = ""
    let varg = []
    let varg_str = ""

    if (params.input !== undefined) input = textToByteString(params.input)
    if (params.cmd_opt !== undefined) cmd_opt = textToByteString(params.cmd_opt)
    if (params.varg !== undefined) varg = textToByteString(params.varg)

    for (const each of languages) {
        if (lang === each) {
            has_lang = true
            break
        }
    }

    if (!has_lang) throw `not supported language: ${lang}`

    for (const each of cmd_opt) {
        cmd_opt_str += textToByteString(each) + "\0"
    }

    for (const each of varg) {
        varg_str += textToByteString(each) + "\0"
    }
    
    let sample = ("Vlang\x001\0${lang}" +
    "\0VTIO_OPTIONS\0${cmd_opt.length}\0${cmd_opt_str}" +
    "F.code.tio\0${code.length}\0${code}" + 
    "F.input.tio\0${input.length}\0${input}" + 
    "Vargs\0${varg.length}\0${varg_str}R").
    replace("${lang}", lang).
    replace("${cmd_opt.length}", cmd_opt.length).
    replace("${cmd_opt_str}", cmd_opt_str).
    replace("${code.length}", code.length).
    replace("${code}", code).
    replace("${input.length}", input.length).
    replace("${input}", input).
    replace("${varg.length}", varg.length).
    replace("${varg_str}", varg_str)

    return deflate(sample)
}

function byteStringToText(byteString) {
	return decodeURIComponent(escape(byteString));
}

function textToByteString(string) {
	return unescape(encodeURIComponent(string));
}

function deflate(byteString) {
	return pako.deflateRaw(byteStringToByteArray(byteString), {"level": 9});
}

function inflate(byteString) {
	return byteArrayToByteString(pako.inflateRaw(byteString));
}

function byteStringToByteArray(byteString) {
	let byteArray = new Uint8Array(byteString.length);
	for(let index = 0; index < byteString.length; index++)
		byteArray[index] = byteString.charCodeAt(index);
	byteArray.head = 0;
	return byteArray;
}

function byteArrayToByteString(byteArray) {
	let retval = "";
	iterate(byteArray, function(byte) { retval += String.fromCharCode(byte); });
	return retval;
}

function iterate(iterable, monad) {
	if (!iterable)
		return;
	for (let i = 0; i < iterable.length; i++)
		monad(iterable[i]);
}

function getRandomBits(minBits) {
	return bufferToHex(getRandomValues(new Uint8Array(minBits + 7 >> 3)).buffer);
}


function bufferToHex(buffer) {
	let dataView = new DataView(buffer);
	let retval = "";

	for (let i = 0; i < dataView.byteLength; i++)
		retval += (256 | dataView.getUint8(i)).toString(16).slice(-2);

	return retval;
}

function random(min,max){
    return Math.floor(Math.random()*(max-min+1)+min)
}

function getRandomValues(buf){ 
    let min =0,max = 255;  
    if (buf.length > 65536) {    
        let e = new Error();      
        e.code = 22;      
        e.message = 'Failed to execute \'getRandomValues\' : The ' +
        'ArrayBufferView\'s byte length (' + buf.length + ') exceeds the ' +        
        'number of bytes of entropy available via this API (65536).';      
        e.name = 'QuotaExceededError';      
        throw e;    
    }    
    if (buf instanceof Uint16Array)  {    
        max = 65535;  
    }  else if (buf instanceof Uint32Array)  {    
        max = 4294967295;  
    }  
    
    for (let element in buf)  {    
        buf[element] = random(min,max); 
    }  
    
    return buf;
}


