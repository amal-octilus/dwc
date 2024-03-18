import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Table from "react-bootstrap/Table";
import { toast } from "react-toastify";
import useAuthInterceptor from "../../../../utils/apis";
import Loader from "../../UI/Loader";
import { hasPermission } from "../../../../CommonComponents/commonMethods";
import { REPORTS_VIEW, REPORTS_EDIT } from "../../../../Constants/constant";
import Card from 'react-bootstrap/Card';
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// define needed URLs here
const postFormDataUrl = "/supplier/PostReportProductList";
const getFormDataUrl = "/supplier/getsalesReport";

const SuperInvoice = ({ img, token }) => {
  // config for api call
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      permission: "reports-view",
    },
  };

  const apis = useAuthInterceptor();

  // modal, formData, loading states
  const [showModal, setShowModal] = useState(false);
  const [validated, setValidated] = useState(false);
  const [formData, setFormData] = useState({
    date_type: "",
    distributer: "",
    from_date: "",
    order_state: "",
    product_type: "",
    to_date: "",
    language: "",
    file_type: "",
  });
  const [loading, setLoading] = useState(false);
  const [getTableDataLoading, setGetTableDataLoading] = useState(false);
  const [tableData, setTableData] = useState([]);

  // testing values for table
  // {
  //   created_at: "123",
  //   file_path: "www.google.com",
  //   file_type: "pdf",
  // },

  // handle change : sets formData
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // from submit
  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    // form valid ?
    if (form.checkValidity() === true) {
      setLoading(true);

      // add permissions based on URL
      config.headers.permission = "reports-view";

      //console.log("form submit", { formData }, { config });
      console.log("form submit", { formData });
      apis
      .post(postFormDataUrl, formData, config)
        //  .post(postFormDataUrl, formData)
        .then((res) => {
          console.log("response", { res });

          if (res.status === 200) {
            toast.success("Profile Information saved!", {
              autoClose: 1000,
              position: toast.POSITION.TOP_CENTER,
            });
            setLoading(false);

            fetchFormData();
          } else {
            toast.error(res.data.message, {
              autoClose: 3000,
              position: toast.POSITION.TOP_CENTER,
            });
            setLoading(false);
          }
        })
        .catch((error) => {
          console.log({ error });

          if (error) {
            toast.error("Something went wrong. Please try again later.", {
              autoClose: 3000,
              position: toast.POSITION.TOP_CENTER,
            });
          }
          setLoading(false);
        });
    }
    setValidated(true);
  };

  // fetch saved form data from db
  const fetchFormData = () => {
    // add permissions based on URL
    config.headers.permission = "reports-view";
    setGetTableDataLoading(true);
    apis
      .get(getFormDataUrl, config)
      //.get(getFormDataUrl)
      .then((res) => {
        if (res.status === 200) {
          console.log("response table data", { res });
          setTableData(res.data.data);
          setGetTableDataLoading(false);
        }
      })
      .catch((error) => {
        console.log({ error });
        setGetTableDataLoading(false);
        if (error) {
          console.log({ error });
        }
      });
    setGetTableDataLoading(false);
  };

  useEffect(() => {
    fetchFormData();
  }, []);

  return (
    <>
      <div className="col-12 d-flex">
        <Card className="reports reports6" style={{ width: '9rem' }}>

      <Card.Body>
    <FontAwesomeIcon icon="fa-solid fa-file-invoice" />
        <Card.Title></Card.Title>
        <Card.Text>
      Super Invoice
        </Card.Text>
        <Button variant="primary" onClick={() => setShowModal(true)}><FontAwesomeIcon icon="fa-solid fa-eye" /></Button>
      </Card.Body>
    </Card>
      </div>

      <Modal
        className="modal fade"
        show={showModal}
        fullscreen={true}
        centered
        onHide={() => setShowModal(false)}
      >
        <Modal.Header>
          <Modal.Title>List of Super invoices</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Row>
              <Col className="report-img">
                <img src={img} alt="" />
              </Col>

              <Col>
                Sébastien Morasse
                <br />
                List of products delivered to buyers
                <br />
                Category
                <br />
                Find out where your products have been delivered during the
                analyzed perio
              </Col>
              <Col xs={6}></Col>
            </Row>

            <hr />
            <Row className="mb-3">
              <Form.Group as={Col} controlId="date-type">
                <Form.Label>Date Type</Form.Label>
                <Form.Control
                  as="select"
                  name="date_type"
                  required
                  onChange={(e) => handleChange(e)}
                >
                  <option value="">Choose...</option>
                  <option value="created_at">Created at</option>
                  <option value="updated_at">Updated at</option>
                </Form.Control>
                <Form.Control.Feedback className="error-label" type="invalid">
                  Date Type is required.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} controlId="from_date">
                <Form.Label>From</Form.Label>
                <Form.Control
                  type="date"
                  name="from_date"
                  onChange={handleChange}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  From date is required.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} controlId="to_date">
                <Form.Label>To</Form.Label>
                <Form.Control
                  type="date"
                  name="to_date"
                  onChange={handleChange}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  To date is required.
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group as={Col} controlId="distributer">
                <Form.Label>By Supplier</Form.Label>
                <Form.Control
                  as="select"
                  required
                  name="distributer"
                  onChange={(e) => handleChange(e)}
                >
                  <option value="">Choose...</option>
                  <option value="Dis1">---</option>
                  <option value="Dis2">---</option>
                </Form.Control>
                <Form.Control.Feedback className="error-label" type="invalid">
                  Supplier is required.
                </Form.Control.Feedback>
              </Form.Group>
            </Row>

            <Row className="mb-3">
            <Form.Group as={Col} controlId="order-state">
              <Form.Label>Order status</Form.Label>
              <Form.Control
                as="select"
                required
                name="order_state"
                onChange={(e) => handleChange(e)}
              >
                <option value="">Choose...</option>
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Onhold">On Hold</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </Form.Control>
              <Form.Control.Feedback className="error-label" type="invalid">
                Order status is required.
              </Form.Control.Feedback>
            </Form.Group>

              <Form.Group as={Col} controlId="product-type">
                <Form.Label>Invoice status</Form.Label>
                <Form.Control
                  as="select"
                  name="product_type"
                  required
                  onChange={(e) => handleChange(e)}
                >
                  <option value="">Choose...</option>
                  <option value="Beer">---</option>
                  <option value="Wine">---</option>
                </Form.Control>
                <Form.Control.Feedback className="error-label" type="invalid">
                  Invoice status is required.
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group as={Col} controlId="product-type">
                <Form.Label>Group</Form.Label>
                <Form.Control
                  as="select"
                  name="product_type"
                  required
                  onChange={(e) => handleChange(e)}
                >
                  <option value="">Choose...</option>
                  <option value="Beer">---</option>
                  <option value="Wine">---</option>
                </Form.Control>
                <Form.Control.Feedback className="error-label" type="invalid">
                  Invoice status is required.
                </Form.Control.Feedback>
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group as={Col} controlId="file-type">
                <Form.Label>File Type</Form.Label>
                <Form.Control
                  as="select"
                  name="file_type"
                  onChange={(e) => handleChange(e)}
                >       <option value="">Choose...</option>
                  <option value="xlsx">XLSX</option>
                  <option value="csv">CSV</option>
                  <option value="pdf">PDF</option>
                </Form.Control>
                {/* <Form.Control.Feedback className="error-label" type="invalid">
                  Please select an option.
                </Form.Control.Feedback> */}
              </Form.Group>
              <Form.Group as={Col} controlId="language">
                <Form.Label>Language</Form.Label>
                <Form.Control
                  as="select"
                  name="language"
                  onChange={(e) => handleChange(e)}
                >       <option value="">Choose...</option>
                  <option value="CAeng">CA Eng</option>
                  <option value="CAfr">CA Fr</option>
                </Form.Control>
              </Form.Group>
            </Row>

            <button
              type="submit"
              class="btn btn-success w-auto"
              disabled={loading}
            >
              Generate List
            </button>
          </Form>
          <hr />
          {!!getTableDataLoading && <Loader />}
          {!getTableDataLoading && (
            <Table responsive striped bordered hover>
              <thead>
                <tr>
                  <th>Created At</th>
                  <th>Download</th>
                  <th>File Type</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((values) => (
                  <tr>
                    <td>{new Date(values?.created_at)?.toLocaleDateString('en-GB').replace(new RegExp("/", 'g'),"-")}</td>
                    <td>
                      <a class="btn btn-success" target="_blank" href={`${values?.file_path}/${values?.filename}`}>
                        Download - {values?.file_type}
                      </a>
                    </td>
                    <td>{values?.file_type}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            variant="warning"
            className="btn btn-danger"
            data-bs-dismiss="modal"
            onClick={() => setShowModal(false)}
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SuperInvoice;
