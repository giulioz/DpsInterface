import React from 'react';

export default class ReactInterval extends React.Component {
    static defaultProps = {
      timeout: 1000
    };
  
    componentDidMount() {
        this.start();
    }
  
    shouldComponentUpdate({timeout, callback}) {
      return (
        this.props.timeout !== timeout ||
        this.props.callback !== callback
      );
    }
  
    componentWillUnmount() {
      this.stop();
    }
  
    callback = async () => {
      if (this.timer) {
        await this.props.callback();
        this.start();
      }
    };
  
    start = () => {
      this.stop();
      this.timer = setTimeout(this.callback, this.props.timeout);
    };
  
    stop = () => {
      clearTimeout(this.timer);
      this.timer = null;
    };
  
    render = () => false;
  }