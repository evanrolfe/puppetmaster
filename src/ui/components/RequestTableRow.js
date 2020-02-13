import { Component } from 'react';

type Props = {
  request: 'object',
  children: 'array'
};

export default class RequestTableRow extends Component<Props> {
  shouldComponentUpdate(nextProps) {
    if (this.props.request.id === nextProps.request.id) return false;

    return true;
  }

  selectItem(item) {
    console.log(`Selecting item ${item}`);
  }

  render() {
    const { children } = this.props;

    return children;
  }
}
