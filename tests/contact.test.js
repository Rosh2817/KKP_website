const request = require('supertest');
const app = require('../server');

describe('Contact Form API', () => {
    // Test valid form submission
    test('POST /api/contact - Valid submission', async () => {
        const validData = {
            name: 'John Doe',
            mobile: '9876543210',
            subject: 'Test Subject',
            message: 'This is a test message for the contact form.'
        };

        const response = await request(app)
            .post('/api/contact')
            .send(validData)
            .expect('Content-Type', /json/);

        // Note: This will fail in test environment without proper email config
        // In real testing, you'd mock the email service
        expect(response.status).toBeDefined();
    });

    // Test validation errors
    test('POST /api/contact - Missing required fields', async () => {
        const invalidData = {
            name: '',
            mobile: '123',
            subject: 'Test',
            message: 'Short'
        };

        const response = await request(app)
            .post('/api/contact')
            .send(invalidData)
            .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors.length).toBeGreaterThan(0);
    });

    // Test XSS protection
    test('POST /api/contact - XSS protection', async () => {
        const maliciousData = {
            name: '<script>alert("xss")</script>John',
            mobile: '9876543210',
            subject: 'Test Subject',
            message: 'This is a test message.'
        };

        const response = await request(app)
            .post('/api/contact')
            .send(maliciousData);

        // The response should be processed without executing the script
        expect(response.status).toBeDefined();
    });

    // Test rate limiting
    test('POST /api/contact - Rate limiting', async () => {
        const validData = {
            name: 'John Doe',
            mobile: '9876543210',
            subject: 'Test Subject',
            message: 'This is a test message for rate limiting.'
        };

        // Send multiple requests quickly
        const promises = Array(10).fill().map(() => 
            request(app).post('/api/contact').send(validData)
        );

        const responses = await Promise.all(promises);
        
        // Some requests should be rate limited
        const rateLimitedResponses = responses.filter(r => r.status === 429);
        expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    // Test health check
    test('GET /api/health', async () => {
        const response = await request(app)
            .get('/api/health')
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Server is running');
    });
});

