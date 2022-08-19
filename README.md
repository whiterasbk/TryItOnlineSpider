# Try It Online Spider
[TryItOnline](https://tio.run/#) is a site which support multiple programming languages 
## Run
```shell
git clone https://github.com/whiterasbk/TryItOnlineSpider.git
cd TryItOnlineSpider
npm install
node sample.js
```

## Usage
```javascript
runCode({
    input: "",
    code: `print("hello world")`, // main code
    run_url: "/cgi-bin/static/fb67788fd3d1ebf92e66b295525335af-run", // can be undefined
    varg: [], cmd_opt: [], lang: "python3" // language
}).then(resp => console.log(resp))
```
