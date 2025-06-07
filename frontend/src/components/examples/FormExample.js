import React, { useState } from 'react';
import Form from '../ui/Form';
import Input from '../ui/Input';
import FormField from '../ui/FormField';
import FormSection from '../ui/FormSection';
import FormGroup from '../ui/FormGroup';
import Button from '../ui/Button';

/**
 * FormExample - Demonstrates the enhanced form components with progressive disclosure and validation
 */
const FormExample = () => {
  // Form state
  const [formValues, setFormValues] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    notes: '',
  });
  
  // Form submission state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Progressive disclosure sections
  const formSections = [
    {
      title: 'Personal Information',
      description: 'Please provide your basic contact information',
      fields: ['firstName', 'lastName', 'email', 'phone'],
    },
    {
      title: 'Professional Information',
      description: 'Tell us about your work',
      fields: ['company', 'jobTitle'],
    },
    {
      title: 'Address Information',
      description: 'Where can we reach you?',
      fields: ['address', 'city', 'state', 'zipCode'],
    },
    {
      title: 'Additional Information',
      description: 'Anything else you want to share',
      fields: ['notes'],
    },
  ];
  
  // Form validation
  const validateForm = (values) => {
    const errors = {};
    
    // First name validation
    if (!values.firstName) {
      errors.firstName = 'First name is required';
    } else if (values.firstName.length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }
    
    // Last name validation
    if (!values.lastName) {
      errors.lastName = 'Last name is required';
    } else if (values.lastName.length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    }
    
    // Email validation
    if (!values.email) {
      errors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
      errors.email = 'Invalid email address';
    }
    
    // Phone validation (optional)
    if (values.phone && !/^\d{10}$/i.test(values.phone.replace(/[^0-9]/g, ''))) {
      errors.phone = 'Phone number must be 10 digits';
    }
    
    // Company validation
    if (!values.company) {
      errors.company = 'Company name is required';
    }
    
    // Zip code validation
    if (values.zipCode && !/^\d{5}(-\d{4})?$/.test(values.zipCode)) {
      errors.zipCode = 'Invalid zip code format';
    }
    
    return errors;
  };
  
  // Field-specific validation functions
  const validateEmail = (value) => {
    if (!value) return 'Email is required';
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
      return 'Invalid email address';
    }
    return '';
  };
  
  const validatePhone = (value) => {
    if (!value) return '';
    if (!/^\d{10}$/i.test(value.replace(/[^0-9]/g, ''))) {
      return 'Phone number must be 10 digits';
    }
    return '';
  };
  
  // Handle form submission
  const handleSubmit = async (values) => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Form submitted:', values);
      setSuccess('Form submitted successfully!');
    } catch (err) {
      setError('An error occurred while submitting the form. Please try again.');
      console.error('Form submission error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Enhanced Form Example</h2>
      
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Progressive Disclosure Form</h3>
        <Form
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
          successMessage={success}
          submitText="Submit Form"
          useProgressiveDisclosure={true}
          sections={formSections}
          validate={validateForm}
          validateOnBlur={true}
          initialValues={formValues}
        >
          {/* Personal Information Section */}
          <FormField
            name="firstName"
            label="First Name"
            required
          >
            <Input 
              placeholder="Enter your first name"
              autoValidate={true}
            />
          </FormField>
          
          <FormField
            name="lastName"
            label="Last Name"
            required
          >
            <Input 
              placeholder="Enter your last name"
              autoValidate={true}
            />
          </FormField>
          
          <FormField
            name="email"
            label="Email Address"
            required
            helperText="We'll never share your email with anyone else"
          >
            <Input 
              type="email"
              placeholder="name@example.com"
              validate={validateEmail}
              autoValidate={true}
              validationMessage="Valid email format"
              showValidationIcon={true}
            />
          </FormField>
          
          <FormField
            name="phone"
            label="Phone Number"
            helperText="Optional"
          >
            <Input 
              type="tel"
              placeholder="(123) 456-7890"
              validate={validatePhone}
              autoValidate={true}
              prefix="📞"
            />
          </FormField>
          
          {/* Professional Information Section */}
          <FormField
            name="company"
            label="Company"
            required
          >
            <Input 
              placeholder="Your company name"
              autoValidate={true}
            />
          </FormField>
          
          <FormField
            name="jobTitle"
            label="Job Title"
          >
            <Input 
              placeholder="Your position"
            />
          </FormField>
          
          {/* Address Information Section */}
          <FormField
            name="address"
            label="Street Address"
          >
            <Input 
              placeholder="1234 Main St"
            />
          </FormField>
          
          <FormGroup layout="grid" columns={3} gap="1rem">
            <FormField
              name="city"
              label="City"
            >
              <Input 
                placeholder="City"
              />
            </FormField>
            
            <FormField
              name="state"
              label="State"
            >
              <Input 
                placeholder="State"
              />
            </FormField>
            
            <FormField
              name="zipCode"
              label="Zip Code"
            >
              <Input 
                placeholder="Zip Code"
                autoValidate={true}
              />
            </FormField>
          </FormGroup>
          
          {/* Additional Information Section */}
          <FormField
            name="notes"
            label="Notes"
            helperText="Any additional information you'd like to share"
          >
            <Input 
              placeholder="Your notes here"
              type="textarea"
            />
          </FormField>
        </Form>
      </div>
      
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Standard Form with Sections</h3>
        <Form
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
          successMessage={success}
          submitText="Submit Form"
          validate={validateForm}
          validateOnBlur={true}
          initialValues={formValues}
        >
          <FormSection 
            title="Personal Information" 
            description="Please provide your basic contact information"
            collapsible={true}
          >
            <FormGroup layout="grid" columns={2}>
              <FormField
                name="firstName"
                label="First Name"
                required
              >
                <Input 
                  placeholder="Enter your first name"
                  autoValidate={true}
                />
              </FormField>
              
              <FormField
                name="lastName"
                label="Last Name"
                required
              >
                <Input 
                  placeholder="Enter your last name"
                  autoValidate={true}
                />
              </FormField>
            </FormGroup>
            
            <FormGroup>
              <FormField
                name="email"
                label="Email Address"
                required
                helperText="We'll never share your email with anyone else"
              >
                <Input 
                  type="email"
                  placeholder="name@example.com"
                  validate={validateEmail}
                  autoValidate={true}
                  validationMessage="Valid email format"
                  showValidationIcon={true}
                />
              </FormField>
              
              <FormField
                name="phone"
                label="Phone Number"
                helperText="Optional"
              >
                <Input 
                  type="tel"
                  placeholder="(123) 456-7890"
                  validate={validatePhone}
                  autoValidate={true}
                  prefix="📞"
                />
              </FormField>
            </FormGroup>
          </FormSection>
          
          <FormSection 
            title="Professional Information" 
            description="Tell us about your work"
            collapsible={true}
            defaultExpanded={false}
          >
            <FormGroup>
              <FormField
                name="company"
                label="Company"
                required
              >
                <Input 
                  placeholder="Your company name"
                  autoValidate={true}
                />
              </FormField>
              
              <FormField
                name="jobTitle"
                label="Job Title"
              >
                <Input 
                  placeholder="Your position"
                />
              </FormField>
            </FormGroup>
          </FormSection>
          
          <FormSection 
            title="Address Information" 
            description="Where can we reach you?"
            collapsible={true}
            defaultExpanded={false}
          >
            <FormField
              name="address"
              label="Street Address"
            >
              <Input 
                placeholder="1234 Main St"
              />
            </FormField>
            
            <FormGroup layout="grid" columns={3} gap="1rem">
              <FormField
                name="city"
                label="City"
              >
                <Input 
                  placeholder="City"
                />
              </FormField>
              
              <FormField
                name="state"
                label="State"
              >
                <Input 
                  placeholder="State"
                />
              </FormField>
              
              <FormField
                name="zipCode"
                label="Zip Code"
              >
                <Input 
                  placeholder="Zip Code"
                  autoValidate={true}
                />
              </FormField>
            </FormGroup>
          </FormSection>
          
          <FormSection 
            title="Additional Information" 
            description="Anything else you'd like to share"
            collapsible={true}
            defaultExpanded={false}
          >
            <FormField
              name="notes"
              label="Notes"
              helperText="Any additional information you'd like to share"
            >
              <Input 
                placeholder="Your notes here"
                type="textarea"
              />
            </FormField>
          </FormSection>
        </Form>
      </div>
    </div>
  );
};

export default FormExample;
