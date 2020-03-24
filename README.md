# Example
```html
<div id="slider">
  <ul>
    <li><img src="hoge" alt=""></li>
    <li><img src="hoge" alt=""></li>
    <li><img src="hoge" alt=""></li>
    <li><img src="hoge" alt=""></li>
    <li><img src="hoge" alt=""></li>
  </ul>
</div>
```

```js
const Slider = require("slider");

let el = document.getElementById("slider");
let slider = new Slider(el);

// Options
slider.displayNum = 1;
slider.slideUnit  = 1;
slider.space      = 30;
slider.itemWidth  = 0;
slider.allowFlickSlide = true

slider.init()
```
