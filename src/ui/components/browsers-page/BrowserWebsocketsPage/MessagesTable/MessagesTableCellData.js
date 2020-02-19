type Props = {
  dataKey: 'string',
  rowData: 'any'
};

export default ({ dataKey, websocketMessage }: Props) => {
  const cellData = websocketMessage[dataKey];

  if (cellData === null || cellData === undefined) return '';

  switch (dataKey) {
    case 'created_at': {
      const time = new Date(cellData);
      return time.toUTCString();
    }

    default:
      return String(cellData);
  }
};
