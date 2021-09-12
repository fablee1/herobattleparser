import { Col } from "react-bootstrap"
import "./InfoCard.css"

const InfoCard = (props) => {
  return (
    <Col xs={4}>
      <div className="InfoCard">
        <div>{props.title}:</div>
        <div>{props.value}</div>
      </div>
    </Col>
  )
}

export default InfoCard
