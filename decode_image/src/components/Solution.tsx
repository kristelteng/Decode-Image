"use client";
import Image from "next/image";
import React, { Component } from 'react';
import { PNG } from 'pngjs/browser';
import { Buffer } from 'buffer';

interface SolutionState {
    imgSrc: string | null;
    secretMsg: string | null;
}

class Solution extends Component<{}, SolutionState> {
    constructor(props: {}) {
        super(props);

        this.state = {
            imgSrc: null,
            secretMsg: null
        }
    }

    async fetchImage() {
        try {
            const response = await fetch('https://mintlify-assets.b-cdn.net/interview/base64.txt');
            const base64Image = ((await response.text()).trim());
            const imgBuffer = Buffer.from(base64Image, 'base64');
            const png = PNG.sync.read(imgBuffer);
    
            const binaryMsg: number[] = [];

            // Loop through each pixel in the image
            for (let y = 0; y < png.height; y++) {
                for (let x = 0; x < png.width; x++) {

                    // Calculate the index of the current pixel in the flat data array
                    const idx = (png.width * y + x) * 4;

                    const red = png.data[idx];
                    const green = png.data[idx + 1];
                    const blue = png.data[idx + 2];
    
                    // Sum the RGB (not A) values of the pixel
                    const sum = red + green + blue;
                    
                    const remainder = sum % 4;

                    const binaryString = remainder.toString(2);

                    // ensure binary string is at least 2 characters long, padding with zeros if necessary
                    const paddedBinaryString = binaryString.padStart(2, '0');
                    const binaryArray = paddedBinaryString.split('');

                    // convert each character in the array from a string to a number
                    const numberArray = binaryArray.map(char => Number(char));

                    //push each number in the numberArr to the binary mesage aray
                    numberArray.forEach(num => binaryMsg.push(num));
                }
            }

            // Converting Binary to Characters
            const binaryString = binaryMsg.join('');
            const byteStrings = binaryString.match(/.{1,8}/g) || [] ;
            const byteArray = [];

            for (const byteString of byteStrings) {
                const byteValue = parseInt(byteString, 2);
                byteArray.push(byteValue);
            }

            let decodedMessage = '';

            for (const byte of byteArray) {
                //convert the byte value to its corresponding character
                const char = String.fromCharCode(byte);
                decodedMessage += char;
            }
    
            this.setState({
                imgSrc: `data:image/png;base64,${base64Image}`,
                secretMsg: decodedMessage
            })

        } catch (error) {
            console.error('Error fetching image', error);
        }
    }

    componentDidMount() {
        this.fetchImage();
    }

    render() {
        const { imgSrc, secretMsg }: any = this.state;

        return (
            <div>
                {imgSrc && <Image src={imgSrc} width={400} height={400}alt="Secret Message Art" />}
                {secretMsg && <p>decoded message: {secretMsg}</p>}
            </div>
        )
    }
}

export default Solution;