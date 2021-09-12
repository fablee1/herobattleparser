import { Col } from "react-bootstrap"
import "./InfoCard.css"

const InfoCard = (props) => {
  return (
    <Col sm={12} md={6} lg={4} className="InfoCardCol">
      <div className="InfoCard">
        <div className="cardTitle">{props.title}:</div>
        <div className="cardText">{props.value}</div>
      </div>
    </Col>
  )
}

export default InfoCard
