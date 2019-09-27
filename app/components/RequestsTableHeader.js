import React, { Component } from 'react';
import ReactDOM from 'react-dom';

type Props = {
  width: 'number',
  minWidth: 'number',
  columnIndex: 'number',
  setTableColumnWidth: 'function',
  className: 'string',
  onClick: 'function',
  orderDir: 'string',
  children: React.Node
};

export default class RequestsTableHeader extends Component<Props> {
  constructor(props) {
    super(props);

    this.state = { draggingColumn: false, width: props.width };

    this._handleMouseMove = this._handleMouseMove.bind(this);
    this._handleMouseUp = this._handleMouseUp.bind(this);
    this._setTableHeaderRef = this._setTableHeaderRef.bind(this);
  }

  componentDidMount() {
    document.addEventListener('mouseup', this._handleMouseUp);
    document.addEventListener('mousemove', this._handleMouseMove);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.draggingColumn === true) return false;

    return true;
  }

  _setTableHeaderRef(element) {
    this.tableHeaderRef = element;
  }

  // Return an array of the previous siblings for an element
  _prevSiblings(element) {
    return this._prevSiblingsRecursive(element, []);
  }

  _prevSiblingsRecursive(element, prevSiblings) {
    const previousSibling = element.previousSibling;

    if (previousSibling !== null) {
      prevSiblings.push(previousSibling);
      return this._prevSiblingsRecursive(previousSibling, prevSiblings);
    }

    return prevSiblings;
  }

  _handleMouseMove(e) {
    if (this.state.draggingColumn === true) {
      const tableHeader = ReactDOM.findDOMNode(this.tableHeaderRef);
      const prevSiblings = this._prevSiblings(tableHeader.previousSibling);
      const previousColumnsWidth = prevSiblings.reduce(
        (sum, element) => sum + parseInt(element.width) + 5,
        0
      );
      let width = e.clientX - 55 - previousColumnsWidth;
      width = Math.max(width, this.props.minWidth);

      tableHeader.previousSibling.width = `${width}px`;
      this.setState({ width: width });
    }
  }

  _handleMouseUp() {
    if (this.state.draggingColumn === true) {
      this.setState({ draggingColumn: false });

      if (this.props.columnIndex > 0) {
        const columnIndex = this.props.columnIndex - 1;
        this.props.setTableColumnWidth(columnIndex, this.state.width);
      }
    }
  }

  handleStartDragColumn() {
    this.setState({ draggingColumn: true });
  }

  render() {
    return (
      <th
        className={`requests-table-header ${this.props.className}`}
        width={this.props.width}
        ref={this._setTableHeaderRef}
      >
        <div
          className="resizable-border-vert"
          onMouseDown={this.handleStartDragColumn.bind(this)}
        >
          <div className="resizable-border-vert-transparent">&nbsp;</div>
        </div>

        <span
          className="requests-table-header-title"
          onClick={this.props.onClick}
        >
          {this.props.children}

          {this.props.className === 'ordered' &&
            this.props.orderDir === 'asc' && (
              <i className="fas fa-caret-up order-icon" />
            )}
          {this.props.className === 'ordered' &&
            this.props.orderDir === 'desc' && (
              <i className="fas fa-caret-down order-icon" />
            )}
        </span>
      </th>
    );
  }
}
