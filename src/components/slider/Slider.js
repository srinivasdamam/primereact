import React, { Component } from 'react'
import PropTypes from 'prop-types';
import DomHandler from '../utils/DomHandler';
import classNames from 'classnames'

export class Slider extends Component {

    static defaultProps = {
        id: null,
        value: null,
        animate: false,
        min: 0,
        max: 100,
        orientation: "horizontal",
        step: null,
        range: false,
        style: null,
        className: null
    }

    static propsTypes = {
        id: PropTypes.string,
        value: PropTypes.number,
        animate: PropTypes.bool,
        min: PropTypes.number,
        max: PropTypes.number,
        orientation: PropTypes.string,
        step: PropTypes.number,
        range: PropTypes.bool,
        style: PropTypes.object,
        className: PropTypes.string,
    }

    constructor(props) {
        super(props);
        this.state = {};
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onBarClick = this.onBarClick.bind(this);
        this.endDrag = this.endDrag.bind(this);
        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.handleValues = [];
        this.isFloatValue = this.isFloat(this.props.value) || this.isFloat(this.props.step);
    }

    isFloat(val) {
        return val != null && Number(val) === val && val % 1 !== 0;
    }

    onMouseDown(event, index) {
        if (this.props.disabled) {
            return;
        }

        this.dragging = true;
        this.updateDomData();
        this.sliderHandleClick = true;
        this.handleIndex = index;
        event.target.style.transition="none";
    }

    onBarClick(event) {
        if (this.props.disabled) {
            return;
        }

        if (!this.sliderHandleClick) {
            this.updateDomData();
            this.handleChange(event);
        }

        this.sliderHandleClick = false;
    }

    handleChange(event) {
        let handleValue = this.calculateHandleValue(event);
        this.setValueFromHandle(event, handleValue);
    }

    setValueFromHandle(event, handleValue) {
        let newValue = this.getValueFromHandle(handleValue);

        if (this.props.range) {
            if (this.props.step) {
                this.handleStepChange(newValue, this.values[this.handleIndex], event);
            }
            else {
                this.handleValues[this.handleIndex] = handleValue;
                this.updateValue(newValue, event);
            }
        }
        else {
            if (this.props.step) {
                this.handleStepChange(newValue, this.value, event);
            }
            else {
                this.handleValue = handleValue;
                this.updateValue(newValue, event);
            }
        }
    }

    handleStepChange(newValue, oldValue, event) {
        let diff = (newValue - oldValue),
        originalEvent = event.originalEvent; 

        if (diff < 0 && (-1 * diff) >= this.props.step / 2) {
            newValue = oldValue - this.props.step;
            this.updateValue(newValue, event);
            
            if(originalEvent && !originalEvent.defaultPrevented) {
                this.updateHandleValue();
            }
        }
        else if (diff > 0 && diff >= this.props.step / 2) {
            newValue = oldValue + this.props.step;
            this.updateValue(newValue, event);
            
            if(originalEvent && !originalEvent.defaultPrevented) {
                this.updateHandleValue();
            }
        }
    }

    updateDomData() {
        let rect = this.container.getBoundingClientRect();
        this.initX = rect.left + DomHandler.getWindowScrollLeft();
        this.initY = rect.top + DomHandler.getWindowScrollTop();
        this.barWidth = this.container.offsetWidth;
        this.barHeight = this.container.offsetHeight;
    }

    calculateHandleValue(event) {
        if (this.props.orientation === 'horizontal')
            return Math.floor(((event.pageX - this.initX) * 100) / (this.barWidth));
        else
            return Math.floor((((this.initY + this.barHeight) - event.pageY) * 100) / (this.barHeight));
    }

    updateHandleValue() {
        if (this.props.range) {
            this.handleValues[0] = (this.values[0] < this.props.min ? 0 : this.values[0] - this.props.min) * 100 / (this.props.max - this.props.min);
            this.handleValues[1] = (this.values[1] > this.props.max ? 100 : this.values[1] - this.props.min) * 100 / (this.props.max - this.props.min);
            this.setState({ handleValues: this.handleValues });
        }
        else {
            if (this.value < this.props.min)
                this.handleValue = 0;
            else if (this.value > this.props.max)
                this.handleValue = 100;
            else
                this.handleValue = (this.value - this.props.min) * 100 / (this.props.max - this.props.min);

            this.setState({ handleValue: this.handleValue });
        }
    }

    updateValue(val, event) {
        if (this.props.range) {
            let value = val;

            if (this.handleIndex === 0) {
                if (value < this.props.min) {
                    value = this.props.min;
                    this.handleValues[0] = 0;
                }
                else if (value > this.values[1]) {
                    value = this.values[1];
                    this.handleValues[0] = this.handleValues[1];
                }
            }
            else {
                if (value > this.props.max) {
                    value = this.props.max;
                    this.handleValues[1] = 100;
                }
                else if (value < this.values[0]) {
                    value = this.values[0];
                    this.handleValues[1] = this.handleValues[0];
                }
            }

            if(this.isFloatValue) {
                this.values[this.handleIndex] = value;
            }
            else {
                this.values[this.handleIndex] = Math.floor(value);
            }

            if (this.props.onChange) {
                this.props.onChange({
                    originalEvent: event,
                    value: this.values
                })
            }
        }
        else {
            if (val < this.props.min) {
                val = this.props.min;
                this.handleValue = 0;
            }
            else if (val > this.props.max) {
                val = this.props.max;
                this.handleValue = 100;
            }

            if(this.isFloatValue) {
                this.value = val;
            }
            else {
                this.value = Math.floor(val);
            }

            if (this.props.onChange) {
                this.props.onChange({
                    originalEvent: event,
                    value: this.value
                })
            }
        }
    }

    getValueFromHandle(handleValue) {
        return (this.props.max - this.props.min) * (handleValue / 100) + this.props.min;
    }

    onDrag(event) {
        if (this.dragging) {
            this.handleChange(event);
        }
    }

    endDrag(event) {
        if (this.dragging) {
            this.dragging = false;
            event.target.style.transition=null;
        }
    }

    onTouchStart(event, index) {
        var touchobj = event.changedTouches[0];
        this.startHandleValue = (this.props.range) ? this.handleValues[index] : this.handleValue;
        this.dragging = true;
        this.handleIndex = index;

        if (this.props.orientation === 'horizontal') {
            this.startx = parseInt(touchobj.clientX, 10);
            this.barWidth = this.container.offsetWidth;
        }
        else {
            this.starty = parseInt(touchobj.clientY, 10);
            this.barHeight = this.container.offsetHeight;
        }


        event.preventDefault();
    }

    onTouchMove(event, index) {
        var touchobj = event.changedTouches[0],
        handleValue = 0;

        if (this.props.orientation === 'horizontal') {
            handleValue = Math.floor(((parseInt(touchobj.clientX, 10) - this.startx) * 100) / (this.barWidth)) + this.startHandleValue;
        }
        else {
            handleValue = Math.floor(((this.starty - parseInt(touchobj.clientY, 10)) * 100) / (this.barHeight))  + this.startHandleValue;
        }

        event.target.style.transition = "none";
        this.setValueFromHandle(event, handleValue);

        event.preventDefault();
    }

    componentWillMount() {
        if (this.props.range)
            this.values = this.props.value || [0, 0];
        else
            this.value = this.props.value || 0;

        this.updateHandleValue();
    }

    componentDidMount() {
        this.documentDragListener = this.onDrag.bind(this);
        document.addEventListener('mousemove', this.documentDragListener);

        this.documentEndDragListener = this.endDrag.bind(this);
        document.addEventListener('mouseup', this.documentEndDragListener);
    }

    componentWillReceiveProps(nextProps) {
        var newValue = nextProps.value;
        if (newValue) {
            if (this.props.range) {
                this.values = newValue;
            }
            else {
                this.value = newValue;
            }
        }
        this.updateHandleValue();
    }

    componentWillUnmount() {
        if (this.documentDragListener) {
            document.removeEventListener('mousemove', this.documentDragListener);
        }
        if (this.documentEndDragListener) {
            document.removeEventListener('mouseup', this.documentEndDragListener);
        }
    }

    render() {
        var className = classNames('ui-slider ui-widget ui-widget-content ui-corner-all', this.props.className, {
            'ui-state-disabled': this.props.disabled,
            'ui-slider-horizontal': this.props.orientation === 'horizontal',
            'ui-slider-vertical': this.props.orientation === 'vertical',
            'ui-slider-animate': this.props.animate
        });

        var verticalRange = this.props.orientation === 'vertical' && <span className="ui-slider-range ui-slider-range-min ui-widget-header ui-corner-all" style={{ 'height': this.state.handleValue + '%' }}></span>;
        if (this.props.range) {
            var leftHandleClass = classNames('ui-slider-handle ui-state-default ui-corner-all', {
                'ui-slider-handle-active': (this.props.handleIndex === 0)
            }),
            rightHandleClass = classNames('ui-slider-handle ui-state-default ui-corner-all', {
                'ui-slider-handle-active': (this.props.handleIndex === 1)
            });

            var middleRange = <span className="ui-slider-range ui-widget-header ui-corner-all" style={{ 'left': this.state.handleValues[0] + '%', width: (this.state.handleValues[1] - this.state.handleValues[0] + '%') }}></span>
            var leftHandle = <span onMouseDown={(e) => this.onMouseDown(e, 0)} onTouchStart={(e) => this.onTouchStart(e, 0)} onTouchMove={(e) => this.onTouchMove(e, 0)} className={leftHandleClass} style={{ 'left': this.state.handleValues[0] + '%' }}></span>
            var rightHandle = <span onMouseDown={(e) => this.onMouseDown(e, 1)} onTouchStart={(e) => this.onTouchStart(e, 1)} onTouchMove={(e) => this.onTouchMove(e, 1)} className={rightHandleClass} style={{ 'left': this.state.handleValues[1] + '%' }}></span>
        }
        else {
            var handle = <span className="ui-slider-handle ui-state-default ui-corner-all" onMouseDown={this.onMouseDown} onTouchStart={this.onTouchStart} onTouchMove={this.onTouchMove}
                        style={{ 'left': this.props.orientation === 'horizontal' ? this.state.handleValue + '%' : null, 'bottom': this.props.orientation === 'vertical' ? this.state.handleValue + '%' : null }}></span>
        }

        return (
            <div id={this.props.id} ref={(el) => { this.container = el } } style={this.props.style} className={className} onClick={this.onBarClick}>
                {handle}
                {middleRange}
                {verticalRange}
                {leftHandle}
                {rightHandle}
            </div>
        );
    }

}