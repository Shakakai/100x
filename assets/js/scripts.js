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
        if (lastValue.length === item.value.length) {
            return null;
        }

        if (lastValue === item.value.slice(0, -1)) {
            return { op: 'a', v: item.value.slice(-1), t: item.time };
        }

        if (lastValue.length - 1 === item.value.length && lastValue.slice(0, -1) === item.value) {
            return { op: 'd', t: item.time };
        }

        return { op: 'r', v: item.value, t: item.time };
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

        switch (value.op) {
            case 'a':
                element.textContent = element.textContent + value.v;
                break;
            case 'd':
                element.textContent = element.textContent.slice(0, -1);
                break;
            default:
                element.textContent = value.v;
        }
    }, 20);

    return localInterval;
}

window.onload = () => {
    const elements = document.querySelectorAll('h1');
    elements.forEach((element) => {
        const values = element.textContent;
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