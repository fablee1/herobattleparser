import "./App.css"
import Web3 from "web3"
import { CHARABI, NFTABI } from "./abi"
import { useState, useEffect } from "react"
import { Col, Container, Form, ListGroup, Row } from "react-bootstrap"
import { getHrbPrice } from "./hrb"
import InfoCard from "./Components/InfoCard/InfoCard"
import hrblogo from "./logo.png"

const bsc = new Web3(
  "wss://speedy-nodes-nyc.moralis.io/4f8aa9d11b6197f3c665705e/bsc/mainnet/ws"
)
const TokenContract = new bsc.eth.Contract(
  NFTABI,
  "0xafCE40Cb46Cc997185a304abD5E67Accd935cb8D"
)

const HeroContract = new bsc.eth.Contract(
  CHARABI,
  "0xA0534687BAfefAE952785FEe997C42d616331088"
)

const App = () => {
  const [weapons, setWeapons] = useState([])
  const [chars, setChars] = useState([])
  const [weaponsSlice, setWeaponsSlice] = useState([])
  const [charsSlice, setCharsSlice] = useState([])
  const [hrbPrice, setHrbPrice] = useState(0)
  const [cheapestToday, setCheapestToday] = useState({ type: "", price: 99999 })

  const [showLastItems, setShowLastItems] = useState(30)

  useEffect(() => {
    getHrbPrice(setHrbPrice)
    setInterval(() => {
      getHrbPrice(setHrbPrice)
    }, 10000)
  }, [])
  useEffect(() => {
    if (weaponsSlice.length !== showLastItems)
      setWeaponsSlice(weapons.slice(0, showLastItems))
    if (weapons[0]?.price < cheapestToday.price)
      setCheapestToday({ type: "Weapon", price: weapons[0].price })
  }, [weapons, showLastItems, cheapestToday.price, weaponsSlice.length])

  useEffect(() => {
    if (charsSlice.length !== showLastItems) setCharsSlice(chars.slice(0, showLastItems))
    if (chars[0]?.price < cheapestToday.price)
      setCheapestToday({ type: "Hero", price: chars[0].price })
  }, [chars, showLastItems, cheapestToday.price, charsSlice.length])

  useEffect(() => {
    TokenContract.methods
      .isTokenAllowed("0xb892585Eae7A206888f9D584Abd01902f10Ab344")
      .call({ from: "0xb892585Eae7A206888f9D584Abd01902f10Ab344" })
      .then((result) => console.log(result))

    TokenContract.methods
      .getListingSlice("0x6B676a57182Ebe222f27839E14ab7a7Be4904a3a", 0, 5000)
      .call({
        from: "0xb892585Eae7A206888f9D584Abd01902f10Ab344",
      })
      .then((result) => {
        const returnedCount = parseInt(result.returnedCount)
        const items = []
        result.ids.slice(0, returnedCount).forEach((e, i) => {
          Math.round(result.prices[i] / Math.pow(10, 18)) > 0 &&
            items.push({
              id: e,
              price: parseFloat(((result.prices[i] / Math.pow(10, 18)) * 1.1).toFixed(2)),
            })
        })
        const sorted = items.sort((a, b) => a.price - b.price)
        setWeapons(sorted)
      })

    TokenContract.methods
      .getListingSlice("0xa0534687bafefae952785fee997c42d616331088", 0, 5000)
      .call({
        from: "0xb892585Eae7A206888f9D584Abd01902f10Ab344",
      })
      .then((result) => {
        const returnedCount = parseInt(result.returnedCount)
        const items = []
        result.ids.slice(0, returnedCount).forEach((e, i) => {
          Math.round(result.prices[i] / Math.pow(10, 18)) > 0 &&
            items.push({
              id: e,
              price: parseFloat(((result.prices[i] / Math.pow(10, 18)) * 1.1).toFixed(2)),
            })
        })
        const sorted = items.sort((a, b) => a.price - b.price)
        setChars(sorted)

        const ids = items.map((i) => parseInt(i.id))
        HeroContract.methods
          .getMultiCharacter(ids)
          .call({ from: "0xb892585Eae7A206888f9D584Abd01902f10Ab344" })
          .then((result) => console.log(result.map((hero, i) => [...hero, items[i].id])))
      })

    TokenContract.events.allEvents({ fromBlock: "latest" }, (err, data) => {
      if (data) {
        if (data.event === "PurchasedListing" || data.event === "CancelledListing") {
          // console.log(data)
          if (
            data.returnValues.nftAddress === "0xA0534687BAfefAE952785FEe997C42d616331088"
          ) {
            setChars((prevState) =>
              prevState
                .filter((c) => c.id !== data.returnValues.nftID)
                .sort((a, b) => a.price - b.price)
            )
          } else {
            setWeapons((prevState) =>
              prevState
                .filter((w) => w.id !== data.returnValues.nftID)
                .sort((a, b) => a.price - b.price)
            )
          }
        } else if (data.event === "NewListing") {
          if (
            data.returnValues.nftAddress === "0xA0534687BAfefAE952785FEe997C42d616331088"
          ) {
            const newChar = {
              id: data.returnValues.nftID,
              price: parseFloat(
                ((data.returnValues.price / Math.pow(10, 18)) * 1.1).toFixed(2)
              ),
            }
            setChars((prevState) =>
              [...prevState, newChar].sort((a, b) => a.price - b.price)
            )
          } else {
            const newWeapon = {
              id: data.returnValues.nftID,
              price: parseFloat(
                ((data.returnValues.price / Math.pow(10, 18)) * 1.1).toFixed(2)
              ),
            }
            setWeapons((prevState) =>
              [...prevState, newWeapon].sort((a, b) => a.price - b.price)
            )
          }
        } else if (data.event === "ListingPriceChange") {
          if (
            data.returnValues.nftAddress === "0xA0534687BAfefAE952785FEe997C42d616331088"
          ) {
            setChars((prevState) => {
              const index = prevState.findIndex((c) => c.id === data.returnValues.nftID)
              const newState = [...prevState]
              if (index !== -1) {
                newState[index].price = parseFloat(
                  ((data.returnValues.newPrice / Math.pow(10, 18)) * 1.1).toFixed(2)
                )
              } else {
                const price = parseFloat(
                  ((data.returnValues.newPrice / Math.pow(10, 18)) * 1.1).toFixed(2)
                )
                newState.push({
                  id: data.returnValues.nftID,
                  price: price,
                })
              }
              return newState.sort((a, b) => a.price - b.price)
            })
          } else {
            setWeapons((prevState) => {
              const index = prevState.findIndex((c) => c.id === data.returnValues.nftID)
              const newState = [...prevState]
              if (index !== -1) {
                newState[index].price = parseFloat(
                  ((data.returnValues.newPrice / Math.pow(10, 18)) * 1.1).toFixed(2)
                )
              } else {
                const price = parseFloat(
                  ((data.returnValues.newPrice / Math.pow(10, 18)) * 1.1).toFixed(2)
                )
                newState.push({
                  id: data.returnValues.nftID,
                  price: price,
                })
              }
              return newState.sort((a, b) => a.price - b.price)
            })
          }
        }
      }
    })
  }, [])
  return (
    <Container>
      <div className="position-relative header-block">
        <img src={hrblogo} alt="" className="main-logo" />
        <h1 className="text-center text-white">Market Tracker</h1>
      </div>
      <div>
        <Row>
          <InfoCard title="HRB Price" value={`${hrbPrice}$`} />
          <InfoCard
            title="Cheapest this session"
            value={cheapestToday.type + " - " + cheapestToday.price + " HRB"}
          />
          <InfoCard
            title="Cheapest right now"
            value={
              weaponsSlice[0]?.price < charsSlice[0]?.price
                ? `Weapon - ${weaponsSlice[0]?.price} HRB`
                : `Hero - ${charsSlice[0]?.price} HRB`
            }
          />
        </Row>
        <div className="TrackingDiv">
          <h2 className="fs-1 d-sm-none text-center mb-4">Tracking</h2>
          <div className="d-flex mb-3">
            <h2 className="fs-1 d-none d-sm-block">Tracking</h2>
            <Form.Group className="mb-3 ms-auto d-flex align-items-center">
              <Form.Label className="fs-5 me-2">Show First:</Form.Label>
              <Form.Control
                type="number"
                style={{ width: "80px" }}
                min={10}
                step={10}
                max={1000}
                value={showLastItems}
                onChange={(e) => setShowLastItems(e.target.value)}
              />
            </Form.Group>
          </div>
          <Row>
            <Col xs={12} md={6}>
              <h2>Weapons: {weapons.length}</h2>
              <ListGroup variant="flush" className="items-list">
                {weaponsSlice.map((i) => (
                  <ListGroup.Item key={i.id}>
                    <span>
                      Id: {i.id}, Price: {i.price}
                    </span>
                    <span className="text-muted">
                      {" "}
                      ≈ {(i.price * hrbPrice).toFixed(2)}$
                    </span>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Col>
            <Col xs={12} md={6}>
              <h2>Characters: {chars.length}</h2>
              <ListGroup variant="flush" className="items-list">
                {charsSlice.map((i) => (
                  <ListGroup.Item key={i.id}>
                    <span>
                      Id: {i.id}, Price: {i.price}
                    </span>
                    <span className="text-muted">
                      {" "}
                      ≈ {(i.price * hrbPrice).toFixed(2)}$
                    </span>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Col>
          </Row>
        </div>
      </div>
    </Container>
  )
}

export default App
