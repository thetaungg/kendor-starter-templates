from solution import parse_csv, sum_column


def test_parse_csv_maps_headers_to_values():
    rows = parse_csv("name, amount\nada, 3\nlin, 4.5")
    assert rows == [
        {"name": "ada", "amount": "3"},
        {"name": "lin", "amount": "4.5"},
    ]


def test_parse_csv_ignores_blank_lines():
    rows = parse_csv("a,b\n\n1,2\n\n")
    assert rows == [{"a": "1", "b": "2"}]


def test_parse_csv_no_data_rows():
    assert parse_csv("only,headers") == []


def test_sum_column_sums_as_floats():
    rows = [{"amount": "3"}, {"amount": "4.5"}]
    assert sum_column(rows, "amount") == 7.5


def test_sum_column_empty_is_zero():
    assert sum_column([], "amount") == 0
