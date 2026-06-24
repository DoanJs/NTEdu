interface Props {
  width?: number;
  height?: number;
}

export default function SpaceComponent(props: Props) {
  const { width, height } = props;
  return <div style={{ width, height }} />;
}
