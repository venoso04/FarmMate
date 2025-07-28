export const getWelcomeEmailTemplate = (username) => {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #28a745; margin-bottom: 10px;">مرحباً بك ${username}!</h1>
                <h1 style="color: #28a745; margin-bottom: 20px;">Welcome ${username}!</h1>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <p style="font-size: 16px; color: #555; margin-bottom: 15px;">
                    تم تأكيد بريدك الإلكتروني بنجاح! يمكنك الآن الاستفادة من جميع خدماتنا.
                </p>
                <p style="font-size: 16px; color: #555; margin-bottom: 20px;">
                    Your email has been successfully verified! You can now enjoy all our services.
                </p>
            </div>
            
            <div style="text-align: center; color: #666; font-size: 14px;">
                <p>شكراً لانضمامك إلينا</p>
                <p>Thank you for joining us</p>
            </div>
        </div>
    `;
};