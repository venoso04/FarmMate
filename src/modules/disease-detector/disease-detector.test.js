// test-new-service.js
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

async function testNewService() {
    // NEW SERVICE URL
    const AI_URL = 'https://anabil111-plantsv2.hf.space';
    const imagePath = 'D:/DataBase/GradProjectAssembly/GradProject1/testing-images/disease1.jpeg';
    
    console.log('🆕 Testing New FastAPI Service');
    console.log('🌐 URL:', AI_URL);
    console.log('📷 Image:', imagePath);
    
    if (!fs.existsSync(imagePath)) {
        console.log('❌ Image not found');
        return;
    }

    console.log('📊 Image size:', Math.round(fs.statSync(imagePath).size / 1024), 'KB\n');

    // Common FastAPI endpoints for file uploads
    const endpoints = [
        '/predict',
        '/predict/',
        '/upload',
        '/uploadfile',
        '/classify',
        '/detect'
    ];

    for (const endpoint of endpoints) {
        console.log(`🧪 Testing: ${endpoint}`);
        
        try {
            const formData = new FormData();
            formData.append('file', fs.createReadStream(imagePath));

            const response = await fetch(`${AI_URL}${endpoint}`, {
                method: 'POST',
                body: formData,
                headers: formData.getHeaders(),
                timeout: 30000
            });

            console.log(`   📡 ${response.status} ${response.statusText}`);
            
            if (response.ok) {
                const result = await response.text();
                console.log(`   ✅ Raw Response:`);
                console.log(result);
                
                try {
                    const json = JSON.parse(result);
                    console.log('\n   🎯 Parsed JSON:');
                    console.log(JSON.stringify(json, null, 4));
                    console.log(`\n🚀 SUCCESS! Working endpoint: ${endpoint}`);
                    return { endpoint, response: json };
                } catch (e) {
                    console.log('   ⚠️  Response is not JSON');
                }
            } else {
                const error = await response.text();
                console.log(`   ❌ Error: ${error}`);
            }
            
        } catch (error) {
            console.log(`   ❌ Request failed: ${error.message}`);
        }
        
        console.log(''); // Empty line for readability
    }

    // Test alternative field names if needed
    console.log('🔄 Trying alternative field names...\n');
    
    const fieldNames = ['image', 'upload_file', 'plant_image'];
    
    for (const fieldName of fieldNames) {
        console.log(`🧪 Testing /predict with field "${fieldName}"`);
        
        try {
            const formData = new FormData();
            formData.append(fieldName, fs.createReadStream(imagePath));

            const response = await fetch(`${AI_URL}/predict`, {
                method: 'POST',
                body: formData,
                headers: formData.getHeaders(),
                timeout: 30000
            });

            console.log(`   📡 ${response.status} ${response.statusText}`);
            
            if (response.ok) {
                const result = await response.text();
                console.log(`   ✅ Success with field "${fieldName}"`);
                console.log(result);
                
                try {
                    const json = JSON.parse(result);
                    console.log('\n   🎯 JSON Response:');
                    console.log(JSON.stringify(json, null, 4));
                    console.log(`\n🚀 SUCCESS! Use field name: "${fieldName}"`);
                    return { endpoint: '/predict', fieldName, response: json };
                } catch (e) {
                    console.log('   ⚠️  Not JSON');
                }
            }
            
        } catch (error) {
            console.log(`   ❌ ${error.message}`);
        }
        
        console.log('');
    }

    return null;
}

// Also test the service info
async function getServiceInfo() {
    const AI_URL = 'https://anabil111-plantsv2.hf.space';
    
    console.log('📋 Getting service information...\n');
    
    // Test common info endpoints
    const infoEndpoints = ['/docs', '/openapi.json', '/', '/health'];
    
    for (const endpoint of infoEndpoints) {
        try {
            const response = await fetch(`${AI_URL}${endpoint}`, { timeout: 10000 });
            console.log(`${endpoint}: ${response.status} ${response.statusText}`);
            
            if (response.ok && endpoint === '/openapi.json') {
                const openapi = await response.json();
                console.log('📖 Available endpoints from OpenAPI:');
                
                if (openapi.paths) {
                    Object.keys(openapi.paths).forEach(path => {
                        const methods = Object.keys(openapi.paths[path]);
                        console.log(`   ${path} [${methods.join(', ').toUpperCase()}]`);
                    });
                }
            }
            
        } catch (error) {
            console.log(`${endpoint}: ❌ ${error.message}`);
        }
    }
    
    console.log('');
}

// Run tests
async function runTests() {
    console.log('Starting tests for new FastAPI service...\n');
    
    await getServiceInfo();
    
    const result = await testNewService();
    
    if (result) {
        console.log('\n🎉 SUCCESS! New service is working!');
        console.log(`✅ Working endpoint: ${result.endpoint}`);
        if (result.fieldName) console.log(`✅ Field name: ${result.fieldName}`);
        
        console.log('\n📝 Update your code with:');
        console.log(`const AI_SERVICE_URL = 'https://anabil111-plantsv2.hf.space';`);
        
        // Show the response structure
        console.log('\n📊 Response structure to handle:');
        console.log(JSON.stringify(result.response, null, 2));
        
    } else {
        console.log('\n❌ Could not find working endpoint');
        console.log('💡 Try visiting https://anabil111-plantsv2.hf.space/docs manually to see the API documentation');
    }
}

runTests().catch(console.error); 

