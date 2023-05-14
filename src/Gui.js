export class TemplateWamElement extends HTMLElement {
	static is() {
		return 'webaudiomodules-template-pmjs';
	}
	constructor() {
		super();

		/** @type {import('./Node.js').default} */
		this.audioNode = null;

		// Append HTML elements
		this.root = this.attachShadow({ mode: 'open' });
		const html = `
        <div style="background-color:#fffbc8 ;text">
        <div><h1 style="color:#2b3320;text-align:center">Hello World plugIn</h1></div>
        <div><h3 style="color:#2b3320;text-align:center" >this is a simple plugin using NPM</h3></div>
<div id="container" style="position: relative; display: flex; flex-direction: column; height: 80px; width: 800px">
    <input style=" -webkit-appearance: none;
    margin-right: 15px;
    width: 200px;
    height: 25px;
    background: #2b3320;
    border-radius: 5px;
    background-image: linear-gradient(#2b3320, #2b3320);
    background-size: 100% 100%;
    background-repeat: no-repeat;" id="gain" type="range" style="flex: 1 1 auto; margin: 2px" min="0" max="1" step="0.01" value="0.1" />
   
</div>
</div>
`;
		this.root.innerHTML = html;
		const div = this.root.getElementById('container');
		this.gainInput = this.root.getElementById('gain');

		this.gainInput.oninput = (e) =>
			this.audioNode.setParameterValues({
				gain: {
					id: 'gain',
					value: +e.currentTarget.value,
					normalized: false,
				},
			});

		this.root.appendChild(div);

		// Update the sliders each animation frame
		this.handleAnimationFrame = async () => {
			if (!this.isConnected || !this.audioNode) {
				this.raf = window.requestAnimationFrame(
					this.handleAnimationFrame
				);
				return;
			}
			const parameterValues = await this.audioNode.getParameterValues();
			Object.values(parameterValues).forEach((data) => {
				const { id, value } = data;
				const slider =
					id === 'gain'
						? this.gainInput
						: id === 'delay'
						? this.delayInput
						: null;
				if (!slider) return;
				if (+slider.value !== value) slider.value = value;
			});
			this.raf = window.requestAnimationFrame(this.handleAnimationFrame);
		};
	}
	connectedCallback() {
		this.raf = window.requestAnimationFrame(this.handleAnimationFrame);
	}
	disconnectedCallback() {
		window.cancelAnimationFrame(this.raf);
	}
}

if (!customElements.get(TemplateWamElement.is())) {
	customElements.define(TemplateWamElement.is(), TemplateWamElement);
}

/** @param {import('./index.js').default} wam */
export default (wam) => {
	const container = new TemplateWamElement();
	container.audioNode = wam.audioNode;
	return container;
};
