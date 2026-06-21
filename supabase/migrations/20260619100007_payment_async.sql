-- Allow a monthly async subscription payment kind.
alter type payment_kind add value if not exists 'async';
