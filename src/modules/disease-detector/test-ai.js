// test-ai.js - Windows compatible
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testAIEndpoint() {
    const AI_URL = 'https://anabil111-plantdisease.hf.space';
    
    // Your image path (use forward slashes or double backslashes)
    const imagePath = 'D:/DataBase/GradProjectAssembly/GradProject1/testing-images/disease1.jpeg';
    
    console.log('🧪 Testing Plant Disease AI Endpoint');
    console.log('📷 Image path:', imagePath);
    
    if (!fs.existsSync(imagePath)) {
        console.log('❌ Image file not found!');
        console.log('Make sure the path is correct:', imagePath);
        return;
    }
    
    const fileSize = fs.statSync(imagePath).size;
    console.log('📊 Image size:', Math.round(fileSize / 1024), 'KB\n');

    // Test Method 1: /predict with FormData
    console.log('🔍 Method 1: Testing /predict endpoint...');
    try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(imagePath));

        const response1 = await fetch(`${AI_URL}/predict`, {
            method: 'POST',
            body: formData,
            headers: formData.getHeaders(),
            timeout: 30000 // 30 second timeout
        });

        console.log('📡 Status:', response1.status, response1.statusText);
        
        if (response1.ok) {
            const result1 = await response1.text();
            console.log('✅ Raw Response:', result1);
            
            try {
                const jsonResult = JSON.parse(result1);
                console.log('🎯 Parsed JSON Response:');
                console.log(JSON.stringify(jsonResult, null, 2));
                
                // This is what you'll use in your integration!
                console.log('\n🚀 SUCCESS! Use this response format in your code.');
                return jsonResult;
                
            } catch (e) {
                console.log('⚠️  Response is not JSON format');
            }
        } else {
            console.log('❌ Request failed with status:', response1.status);
            const errorText = await response1.text();
            console.log('Error details:', errorText);
        }
        
    } catch (error) {
        console.log('❌ Method 1 failed:', error.message);
    }

    console.log('\n' + '='.repeat(60) + '\n');

    // Test Method 2: /api/predict
    console.log('🔍 Method 2: Testing /api/predict endpoint...');
    try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(imagePath));

        const response2 = await fetch(`${AI_URL}/api/predict`, {
            method: 'POST',
            body: formData,
            headers: formData.getHeaders(),
            timeout: 30000
        });

        console.log('📡 Status:', response2.status, response2.statusText);
        
        if (response2.ok) {
            const result2 = await response2.text();
            console.log('✅ Raw Response:', result2);
            
            try {
                const jsonResult = JSON.parse(result2);
                console.log('🎯 Parsed JSON Response:');
                console.log(JSON.stringify(jsonResult, null, 2));
                
                console.log('\n🚀 SUCCESS! Use this response format in your code.');
                return jsonResult;
                
            } catch (e) {
                console.log('⚠️  Response is not JSON format');
            }
        }
        
    } catch (error) {
        console.log('❌ Method 2 failed:', error.message);
    }

    console.log('\n' + '='.repeat(60) + '\n');

    // Test Method 3: Base64 approach
    console.log('🔍 Method 3: Testing with Base64 encoding...');
    try {
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = imageBuffer.toString('base64');
        const mimeType = path.extname(imagePath).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';

        const response3 = await fetch(`${AI_URL}/api/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                data: [`data:${mimeType};base64,${base64Image}`]
            }),
            timeout: 30000
        });

        console.log('📡 Status:', response3.status, response3.statusText);
        
        if (response3.ok) {
            const result3 = await response3.text();
            console.log('✅ Raw Response:', result3);
            
            try {
                const jsonResult = JSON.parse(result3);
                console.log('🎯 Parsed JSON Response:');
                console.log(JSON.stringify(jsonResult, null, 2));
                
                console.log('\n🚀 SUCCESS! Use this response format in your code.');
                return jsonResult;
                
            } catch (e) {
                console.log('⚠️  Response is not JSON format');
            }
        }

    } catch (error) {
        console.log('❌ Method 3 failed:', error.message);
    }

    console.log('\n❌ All methods failed. The AI service might be down or require different authentication.');
}

// Run the test
console.log('Starting AI endpoint test...\n');
testAIEndpoint().then((result) => {
    if (result) {
        console.log('\n🎉 Test completed successfully!');
        console.log('You can now use this response format in your Farm Mate integration.');
    } else {
        console.log('\n❌ Test failed. Try checking:');
        console.log('1. Internet connection');
        console.log('2. Image file path');
        console.log('3. AI service status');
    }
}).catch(console.error);