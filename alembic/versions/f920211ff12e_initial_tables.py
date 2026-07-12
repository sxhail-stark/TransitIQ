"""initial tables

Revision ID: f920211ff12e
Revises: 
Create Date: 2026-07-12 13:55:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'f920211ff12e'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Users Table
    op.create_table(
        'users',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    # 2. Drivers Table
    op.create_table(
        'drivers',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('license_number', sa.String(length=100), nullable=False),
        sa.Column('license_expiry', sa.DateTime(), nullable=False),
        sa.Column('phone', sa.String(length=20), nullable=False),
        sa.Column('photo_url', sa.String(length=500), nullable=True),
        sa.Column('experience_years', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=True),
        sa.Column('safety_score', sa.Integer(), nullable=True),
        sa.Column('trips_completed', sa.Integer(), nullable=True),
        sa.Column('incidents_count', sa.Integer(), nullable=True),
        sa.Column('user_id', sa.String(length=36), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_drivers_license_number'), 'drivers', ['license_number'], unique=True)
    op.create_index(op.f('ix_drivers_status'), 'drivers', ['status'], unique=False)

    # 3. Vehicles Table
    op.create_table(
        'vehicles',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('registration_number', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('model', sa.String(length=255), nullable=False),
        sa.Column('capacity', sa.Float(), nullable=False),
        sa.Column('fuel_type', sa.String(length=50), nullable=False),
        sa.Column('odometer', sa.Float(), nullable=True),
        sa.Column('insurance_number', sa.String(length=100), nullable=False),
        sa.Column('fitness_certificate', sa.String(length=100), nullable=False),
        sa.Column('rc_number', sa.String(length=100), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=True),
        sa.Column('safety_score', sa.Integer(), nullable=True),
        sa.Column('health_score', sa.Integer(), nullable=True),
        sa.Column('maintenance_due', sa.DateTime(), nullable=True),
        sa.Column('current_driver_id', sa.String(length=36), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['current_driver_id'], ['drivers.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_vehicles_registration_number'), 'vehicles', ['registration_number'], unique=True)
    op.create_index(op.f('ix_vehicles_status'), 'vehicles', ['status'], unique=False)

    # 4. Vehicle Documents Table
    op.create_table(
        'vehicle_documents',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('vehicle_id', sa.String(length=36), nullable=False),
        sa.Column('doc_type', sa.String(length=50), nullable=False),
        sa.Column('doc_name', sa.String(length=255), nullable=False),
        sa.Column('file_path', sa.String(length=500), nullable=False),
        sa.Column('expiry_date', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['vehicle_id'], ['vehicles.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 5. Driver Documents Table
    op.create_table(
        'driver_documents',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('driver_id', sa.String(length=36), nullable=False),
        sa.Column('doc_type', sa.String(length=50), nullable=False),
        sa.Column('doc_name', sa.String(length=255), nullable=False),
        sa.Column('file_path', sa.String(length=500), nullable=False),
        sa.Column('expiry_date', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['driver_id'], ['drivers.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 6. Trips Table
    op.create_table(
        'trips',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('trip_number', sa.String(length=50), nullable=False),
        sa.Column('source', sa.String(length=255), nullable=False),
        sa.Column('destination', sa.String(length=255), nullable=False),
        sa.Column('vehicle_id', sa.String(length=36), nullable=False),
        sa.Column('driver_id', sa.String(length=36), nullable=False),
        sa.Column('cargo_weight', sa.Float(), nullable=False),
        sa.Column('estimated_distance', sa.Float(), nullable=False),
        sa.Column('expected_fuel', sa.Float(), nullable=False),
        sa.Column('actual_fuel', sa.Float(), nullable=True),
        sa.Column('dispatch_time', sa.DateTime(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=True),
        sa.Column('eta', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['driver_id'], ['drivers.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['vehicle_id'], ['vehicles.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_trips_dispatch_time'), 'trips', ['dispatch_time'], unique=False)
    op.create_index(op.f('ix_trips_status'), 'trips', ['status'], unique=False)
    op.create_index(op.f('ix_trips_trip_number'), 'trips', ['trip_number'], unique=True)

    # 7. Trip Timeline Table
    op.create_table(
        'trip_timeline',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('trip_id', sa.String(length=36), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('location', sa.String(length=255), nullable=True),
        sa.Column('timestamp', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['trip_id'], ['trips.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 8. Maintenance Records Table
    op.create_table(
        'maintenance_records',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('vehicle_id', sa.String(length=36), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('maintenance_type', sa.String(length=50), nullable=False),
        sa.Column('cost', sa.Float(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=True),
        sa.Column('scheduled_date', sa.DateTime(), nullable=False),
        sa.Column('started_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('workshop', sa.String(length=255), nullable=False),
        sa.Column('invoice_url', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['vehicle_id'], ['vehicles.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_maintenance_records_status'), 'maintenance_records', ['status'], unique=False)

    # 9. Maintenance Images Table
    op.create_table(
        'maintenance_images',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('maintenance_id', sa.String(length=36), nullable=False),
        sa.Column('image_url', sa.String(length=500), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['maintenance_id'], ['maintenance_records.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 10. Fuel Logs Table
    op.create_table(
        'fuel_logs',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('vehicle_id', sa.String(length=36), nullable=False),
        sa.Column('driver_id', sa.String(length=36), nullable=False),
        sa.Column('trip_id', sa.String(length=36), nullable=True),
        sa.Column('quantity', sa.Float(), nullable=False),
        sa.Column('cost', sa.Float(), nullable=False),
        sa.Column('odometer', sa.Float(), nullable=False),
        sa.Column('date', sa.DateTime(), nullable=False),
        sa.Column('location', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['driver_id'], ['drivers.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['trip_id'], ['trips.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['vehicle_id'], ['vehicles.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 11. Expenses Table
    op.create_table(
        'expenses',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('date', sa.DateTime(), nullable=False),
        sa.Column('vehicle_id', sa.String(length=36), nullable=True),
        sa.Column('trip_id', sa.String(length=36), nullable=True),
        sa.Column('invoice_url', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['trip_id'], ['trips.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['vehicle_id'], ['vehicles.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 12. Notifications Table
    op.create_table(
        'notifications',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('type', sa.String(length=50), nullable=False),
        sa.Column('priority', sa.String(length=20), nullable=True),
        sa.Column('is_read', sa.Boolean(), nullable=True),
        sa.Column('user_id', sa.String(length=36), nullable=True),
        sa.Column('vehicle_id', sa.String(length=36), nullable=True),
        sa.Column('driver_id', sa.String(length=36), nullable=True),
        sa.Column('trip_id', sa.String(length=36), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['driver_id'], ['drivers.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['trip_id'], ['trips.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['vehicle_id'], ['vehicles.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_notifications_is_read'), 'notifications', ['is_read'], unique=False)

    # 13. Safety Scores Table
    op.create_table(
        'safety_scores',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('entity_type', sa.String(length=50), nullable=False),
        sa.Column('entity_id', sa.String(length=36), nullable=False),
        sa.Column('score', sa.Integer(), nullable=False),
        sa.Column('component_scores', sa.JSON(), nullable=False),
        sa.Column('calculation_date', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_safety_scores_entity_id'), 'safety_scores', ['entity_id'], unique=False)

    # 14. Activity Logs Table
    op.create_table(
        'activity_logs',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=True),
        sa.Column('action', sa.String(length=255), nullable=False),
        sa.Column('entity_type', sa.String(length=50), nullable=True),
        sa.Column('entity_id', sa.String(length=36), nullable=True),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )

    # 15. Analytics Cache Table
    op.create_table(
        'analytics_cache',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('key', sa.String(length=255), nullable=False),
        sa.Column('value', sa.JSON(), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_analytics_cache_key'), 'analytics_cache', ['key'], unique=True)


def downgrade() -> None:
    op.drop_table('analytics_cache')
    op.drop_table('activity_logs')
    op.drop_table('safety_scores')
    op.drop_index(op.f('ix_notifications_is_read'), table_name='notifications')
    op.drop_table('notifications')
    op.drop_table('expenses')
    op.drop_table('fuel_logs')
    op.drop_table('maintenance_images')
    op.drop_index(op.f('ix_maintenance_records_status'), table_name='maintenance_records')
    op.drop_table('maintenance_records')
    op.drop_table('trip_timeline')
    op.drop_index(op.f('ix_trips_trip_number'), table_name='trips')
    op.drop_index(op.f('ix_trips_status'), table_name='trips')
    op.drop_index(op.f('ix_trips_dispatch_time'), table_name='trips')
    op.drop_table('trips')
    op.drop_table('driver_documents')
    op.drop_table('vehicle_documents')
    op.drop_index(op.f('ix_vehicles_status'), table_name='vehicles')
    op.drop_index(op.f('ix_vehicles_registration_number'), table_name='vehicles')
    op.drop_table('vehicles')
    op.drop_index(op.f('ix_drivers_status'), table_name='drivers')
    op.drop_index(op.f('ix_drivers_license_number'), table_name='drivers')
    op.drop_table('drivers')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
