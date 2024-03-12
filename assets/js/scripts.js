var body = document.querySelector('body')
var menuTrigger = document.querySelector('#toggle-main-menu-mobile');
var menuContainer = document.querySelector('#main-menu-mobile');

menuTrigger.onclick = function() {
    menuContainer.classList.toggle('open');
    menuTrigger.classList.toggle('is-active')
    body.classList.toggle('lock-scroll')
}

// Provides a typewriter effect
const compressData = (values) => {
    const toCompressedItem = (lastValue, item) => {
        return { op: 'a', v: item.value, t: item.time };
    }

    const compressed = [];
    let lastValue = '';

    for (let i = 0; i < values.length; i++) {
        let item = values[i];
        let compressedItem = toCompressedItem(lastValue, item);

        if (compressedItem) {
            compressed.push(compressedItem);
            lastValue = item.value;
        }
    }

    return compressed;
};

const replayText = (element, values) => {
    element.textContent = '';
    const printingStart = new Date();

    let localInterval = setInterval(() => {
        const timePassed = new Date() - printingStart;

        const value = values.shift();

        if (!value) {
            clearInterval(localInterval);

            return;
        }

        if (value.t > timePassed) {
            values.unshift(value);

            return;
        }

        element.textContent = element.textContent + value.v;
    }, 20);

    return localInterval;
}

window.onload = () => {
    const elements = document.querySelectorAll('h1');
    elements.forEach((element) => {
        const values = element.textContent.split("");
        let result = [];
        let t = 0;
        values.forEach((value, index) => {
            result.push({ value, time: t });
            t = t + 50 + (Math.random() * 100);
        });
        const compressed = compressData(result);
        replayText(element, compressed);
    });
}