import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {Button, Col, Container, Row, Spinner} from "reactstrap";
import {storage} from "../firebase";
import {getDownloadURL, ref, uploadBytes} from "firebase/storage";
import {v4 as uuidv4} from "uuid";
import constants from "../config/Constants.json";

import img from "../assets/images/noImage.jpg";
import "../styles/create-item.css";
import NftCard from "../components/ui/Nft-card/NftCard";

const Create = ({marketplace, characters, account}) => {
    const [item, setItem] = useState({
        id: "01",
        name: "Lorem Ipsum",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Veniam adipisci cupiditate officia, nostrum et deleniti vero corrupti facilis minima laborum nesciunt nulla error natus saepe illum quasi ratione suscipit tempore dolores. Recusandae, similique modi voluptates dolore repellat eum earum sint.",
        image: img,
        imageFile: null,
        seller: account ? account.address : "",
        price: 0
    });
    const [loading, setLoading] = useState(null);

    const navigate = useNavigate();

    const handleSubmit = async e => {
        console.log("submitting")
        setLoading("submitting");
        e.preventDefault();

        try {
            const file = item.imageFile;
            const metadata = {
                "dna": "",
                "name": "",
                "description": "",
                "image": "",
                "edition": 1,
                "date": Date.now(),
                "attributes": [{
                    "trait_type": "Level",
                    "value": "1"
                }]
            };

            console.log(file)
            if (typeof file !== 'undefined') {
                try {
                    // Create a reference to image
                    const imageRef = ref(storage, `nftImages/${uuidv4()}.${file.type.split("/").pop()}`);
                    const imageSnapshot = await uploadBytes(imageRef, file, {
                        contentType: file.type,
                    });
                    const _imageUrl = await getDownloadURL(imageSnapshot.ref);

                    metadata.name = item.name;
                    metadata.description = item.description;
                    metadata.image = _imageUrl;

                    // convert your object into a JSON-string
                    const metaString = JSON.stringify(metadata);
                    // create a Blob from the JSON-string
                    const metaBlob = new Blob([metaString], {type: "application/json"})

                    // Create a reference to metadata
                    const metaRef = ref(storage, `nftMetadata/${uuidv4()}.json`);
                    const metaSnapshot = await uploadBytes(metaRef, metaBlob, {
                        contentType: "application/json",
                    });
                    const _metaUrl = await getDownloadURL(metaSnapshot.ref);

                    // get approval for marketplace from user
                    await characters.methods.setApprovalForAll(marketplace.options.address, true);
                    // mint new nft
                    await characters.methods.mint(_metaUrl, constants.secretKey).send({from: account.address});

                    navigate('/home');
                } catch (error) {
                    setLoading(null);
                    console.log("image upload error: ", error)
                }
            }
        } catch (error) {
            setLoading(null);
            console.log("nft creation error: ", error)
        }

        setLoading(null);
    }

    return (
        <section  className="mb-5">
            <Container>
                <Row>
                    <Col lg="3" md="4" sm="6">
                        <h5 className="mb-3 text-light">Preview Item</h5>
                        <NftCard item={item} preview/>
                    </Col>

                    <Col lg="9" md="8" sm="6">
                        <div className="create__item">
                            <form onSubmit={handleSubmit}>

                                <div className="form__input">
                                    <label  htmlFor="">Name</label>
                                    <input type="text" placeholder="Enter name" required
                                           onChange={e => setItem({...item, name: e.target.value})}
                                    />
                                </div>

                                <div className="form__input">
                                    <label htmlFor="">Description</label>
                                    <textarea
                                        name="" id="" rows="7"
                                        placeholder="Enter description"
                                        className="w-100" required
                                        onChange={e => setItem({...item, description: e.target.value})}
                                    />
                                </div>

                                <div className="form__input">
                                    <label htmlFor="">Upload File</label>
                                    <input type="file" className="upload__input" accept="image/*" required
                                           onChange={e => {
                                               let preview = item.image;
                                               if (e.target.files && e.target.files.length > 0) {
                                                   preview = URL.createObjectURL(e.target.files[0]);
                                               }
                                               setItem({...item, image: preview, imageFile: e.target.files[0]})

                                               console.log({...item, image: preview, imageFile: e.target.files[0]});
                                           }}
                                    />
                                </div>
                                <Button style={{backgroundColor:"#89B450",border:"none"}} className="save"  type="submit" disabled={loading === 'submitting'}>{
                                    loading === "submitting" ?
                                        <Spinner color="white"/> :
                                        "Save"
                                }</Button>

                            </form>
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default Create;
