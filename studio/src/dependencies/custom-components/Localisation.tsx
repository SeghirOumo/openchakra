import React, { useState, useEffect } from "react";
import { Input } from '@chakra-ui/react'
import useDebounce from "~dependencies/hooks/useDebounce.hook";
import nominatim from "nominatim-client";
import axios from "axios"

const Localisation = 
  ({
    value = "",
    ...rest
  }: {
    value: string
  }) => {

    const [searchLocation, setSearchLocation] = useState(value);
    const debouncedValue = useDebounce(searchLocation, 500)

    const client = nominatim.createClient({
      useragent: 'My Alfred',
      referer: 'https://my-alfred.io',
    });

    useEffect(() => {

      if (debouncedValue && debouncedValue?.length > 2) {
        const query = {
          // q: debouncedValue,
          q: '1 boulevard Anatole France Belfort',
          addressdetails: 1, 
          dedupe: 1, 
          countrycodes: 'fr'
        };
        
        const url = encodeURI("https://nominatim.openstreetmap.org/?format=json&q=1 boulevard Anatole France Belfort&addressdetails=1&dedupe=1&countrycodes=fr")

        const res = fetch(url, {
          method: "GET",
          credentials: "include",
        }).then(res => console.log(res))
        
        // const results = client.search(query)
        //   .then(
        //     (result) => console.log(result)
        //   );
      }
    }, [debouncedValue])

    return (
      <Input 
        type="search" 
        value={searchLocation}
        onChange={(e) => setSearchLocation(e.currentTarget.value) }
        {...rest}
      />
    );
  }

Localisation.displayName = "Localisation";

export default Localisation;
