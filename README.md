# pixel2core
Simple pixelart to core pbt node.js file.
Made it a while ago and decided, hey, why don't I release it.

## Instructions
1. Install npm module `get-pixels`
```bash
npm install get-pixels --save
```
2. Require the pixel2core.js script into your code.
```js
const pixel2core = require('location/of/pixel2core.js');
```
3. Use it.
```js
pixel2core([__dirname + '/input.png', "example", "cube"], (success, data) => {
  if (success == true) {
    //data is pbt file text, save as file with .pbt ending
  } else {
    //data is table with code and message of error
    console.log(data.message)
  };
});
```

I know this is some crappy code.
I rushed at making it and really didn't care about format in the slightest.
But here you go.
