import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
} from '@mui/material';
import { MonetizationOn } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useUser } from '../context/UserContext';

interface BidFormProps {
  currentBid: number;
  onSubmit: (amount: number) => Promise<boolean>;
  disabled: boolean;
}

const bidSchema = Yup.object().shape({
  amount: Yup.number()
    .required('Bid amount is required')
    .positive('Bid must be positive')
    .min(1, 'Minimum bid is $1'),
});

const BidForm: React.FC<BidFormProps> = ({ currentBid, onSubmit, disabled }) => {
  const { t } = useTranslation();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    return (
      <Paper sx={{ p: 2, mt: 2 }}>
        <Alert severity="info">
          {t('messages.loginRequired')}
        </Alert>
      </Paper>
    );
  }

  if (disabled) {
    return (
      <Paper sx={{ p: 2, mt: 2 }}>
        <Alert severity="warning">
          {t('auction.auctionEnded')}
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
        <MonetizationOn color="primary" />
        {t('auction.placeBid')}
      </Typography>
      
      <Formik
        initialValues={{ amount: currentBid + 1 }}
        validationSchema={bidSchema}
        onSubmit={async (values, { setFieldError, resetForm }) => {
          if (values.amount <= currentBid) {
            setFieldError('amount', t('messages.bidTooLow'));
            return;
          }

          setIsSubmitting(true);
          const success = await onSubmit(values.amount);
          setIsSubmitting(false);

          if (success) {
            resetForm({ values: { amount: values.amount + 1 } });
          }
        }}
      >
        {({ values, errors, touched, handleChange, handleBlur }) => (
          <Form>
            <Box display="flex" gap={2} alignItems="flex-start">
              <TextField
                name="amount"
                type="number"
                label={t('auction.bidAmount')}
                value={values.amount}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.amount && !!errors.amount}
                helperText={
                  touched.amount && errors.amount 
                    ? errors.amount 
                    : `${t('auction.currentBid')}: $${currentBid}`
                }
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                }}
                sx={{ flexGrow: 1 }}
                disabled={isSubmitting}
              />
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting || values.amount <= currentBid}
                sx={{ height: 56 }}
              >
                {isSubmitting ? 'Placing...' : t('auction.placeBid')}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Paper>
  );
};

export default BidForm;
