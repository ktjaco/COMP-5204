--DROP FUNCTION my_dijkstra(varchar, double precision, double precision, double precision, double precision);

CREATE OR REPLACE FUNCTION my_dijkstra(
    IN edges_subset varchar,
    IN x1 double precision,
    IN y1 double precision,
    IN x2 double precision,
    IN y2 double precision,
        OUT seq INTEGER,
        OUT cost FLOAT,
        OUT name TEXT,
        OUT geom geometry
    )
    RETURNS SETOF record AS
$BODY$
    WITH
    dijkstra AS (
        SELECT * FROM pgr_dijkstra(
            'SELECT gid as id, source, target, cost_s AS cost,
         reverse_cost_s AS reverse_cost FROM ' || $1,
            -- source
            (SELECT id FROM ways_vertices_pgr
        ORDER BY the_geom <-> ST_SetSRID(ST_Point(x1,y1),4326) LIMIT 1),
            -- target
            (SELECT id FROM ways_vertices_pgr 
        ORDER BY the_geom <-> ST_SetSRID(ST_Point(x2,y2),4326) LIMIT 1),
        true)
    )
    SELECT dijkstra.seq, dijkstra.cost, ways.name,
    CASE
        WHEN dijkstra.node = ways.source THEN the_geom
        ELSE ST_Reverse(the_geom)
    END AS route_geom
    FROM dijkstra JOIN ways
    ON (edge = gid) ORDER BY seq;
$BODY$
LANGUAGE 'sql';
