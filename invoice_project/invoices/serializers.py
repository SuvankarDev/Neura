from rest_framework import serializers
from .models import Invoice, InvoiceDetail
from django.core.exceptions import ValidationError


class InvoiceDetailSerializer(serializers.ModelSerializer):
    # Serializer method to compute line_total
    line_total = serializers.SerializerMethodField()

    class Meta:
        model = InvoiceDetail
        fields = ['id', 'description', 'quantity', 'unit_price', 'line_total']

    def get_line_total(self, obj):
        """
        Calculate the line total for each invoice detail.
        """
        return obj.quantity * obj.unit_price

    def validate_quantity(self, value):
        """
        Validate that quantity is a positive integer.
        """
        if value <= 0:
            raise serializers.ValidationError("Quantity must be a positive integer.")
        return value

    def validate_unit_price(self, value):
        """
        Validate that unit price is a positive decimal.
        """
        if value <= 0:
            raise serializers.ValidationError("Unit price must be a positive value.")
        return value

    def validate_description(self, value):
        """
        Validate that description is not empty or just whitespace.
        """
        if not value.strip():
            raise serializers.ValidationError("Description cannot be empty or whitespace.")
        return value


class InvoiceSerializer(serializers.ModelSerializer):
    # Nested InvoiceDetailSerializer to handle invoice details
    details = InvoiceDetailSerializer(many=True)

    class Meta:
        model = Invoice
        fields = ['id', 'invoice_number', 'customer_name', 'date', 'details']

    def validate(self, data):
        """
        Validate overall invoice data including details and uniqueness.
        """
        self._validate_details(data.get('details'))
        self._validate_invoice_number(data.get('invoice_number'))
        self._validate_customer_name(data.get('customer_name'))
        self._validate_date(data.get('date'))
        return data

    def _validate_details(self, details):
        """
        Ensure at least one detail exists in the invoice.
        """
        if not details:
            raise serializers.ValidationError("Invoice must have at least one detail item.")

    def _validate_invoice_number(self, invoice_number):
        """
        Ensure invoice_number is unique.
        """
        if Invoice.objects.filter(invoice_number=invoice_number).exists():
            raise serializers.ValidationError("Invoice number must be unique.")

    def _validate_customer_name(self, customer_name):
        """
        Ensure customer_name is not empty or just whitespace.
        """
        if not customer_name.strip():
            raise serializers.ValidationError("Customer name cannot be empty.")

    def _validate_date(self, date):
        """
        Ensure date is not empty.
        """
        if not date:
            raise serializers.ValidationError("Date cannot be empty.")

    def create(self, validated_data):
        """
        Create a new Invoice and associated InvoiceDetails.
        """
        details_data = validated_data.pop('details')
        invoice = Invoice.objects.create(**validated_data)

        # Create associated InvoiceDetails
        self._create_invoice_details(invoice, details_data)

        return invoice

    def update(self, instance, validated_data):
        """
        Update an existing Invoice and associated InvoiceDetails.
        """
        details_data = validated_data.pop('details')
        instance.invoice_number = validated_data.get('invoice_number', instance.invoice_number)
        instance.customer_name = validated_data.get('customer_name', instance.customer_name)
        instance.date = validated_data.get('date', instance.date)
        instance.save()

        # Clear existing details and add new ones
        instance.details.all().delete()
        self._create_invoice_details(instance, details_data)

        return instance

    def _create_invoice_details(self, invoice, details_data):
        """
        Create InvoiceDetail instances for a given invoice.
        """
        for detail_data in details_data:
            InvoiceDetail.objects.create(invoice=invoice, **detail_data)

    def delete(self, instance):
        """
        Delete the invoice and all associated details.
        """
        instance.details.all().delete()  # Delete related InvoiceDetails first
        instance.delete()  # Delete the invoice itself
        return {"message": "Invoice and its details deleted successfully."}
