from rest_framework import serializers
from .models import Invoice, InvoiceDetail


class InvoiceDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceDetail
        fields = ['id', 'description', 'quantity', 'unit_price', 'line_total']

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be a positive integer.")
        return value

    def validate_unit_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Unit price must be a positive value.")
        return value


class InvoiceSerializer(serializers.ModelSerializer):
    details = InvoiceDetailSerializer(many=True)

    class Meta:
        model = Invoice
        fields = ['id', 'invoice_number', 'customer_name', 'date', 'details']

    def validate(self, data):
        if not data.get('details'):
            raise serializers.ValidationError("Invoice must have at least one detail item.")
        return data

    def create(self, validated_data):
        # Pop the 'details' data from the main validated data
        details_data = validated_data.pop('details')

        # Create the Invoice instance
        invoice = Invoice.objects.create(**validated_data)

        # Create associated InvoiceDetail instances
        for detail_data in details_data:
            InvoiceDetail.objects.create(invoice=invoice, **detail_data)

        return invoice

    def update(self, instance, validated_data):
        # Update main invoice fields
        details_data = validated_data.pop('details')
        instance.invoice_number = validated_data.get('invoice_number', instance.invoice_number)
        instance.customer_name = validated_data.get('customer_name', instance.customer_name)
        instance.date = validated_data.get('date', instance.date)
        instance.save()

        # Handle related details
        # Delete all existing details and recreate them
        instance.details.all().delete()

        for detail_data in details_data:
            InvoiceDetail.objects.create(invoice=instance, **detail_data)

        return instance

    def delete(self, instance):
        # Deletes the invoice and associated details
        instance.delete()
        return {"message": "Invoice and its details deleted successfully."}
